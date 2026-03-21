const { EventEmitter } = require('events');
const crypto = require('crypto');
const PQueue = require('p-queue').default; // Using v6 for CommonJS support

// ─── Metrics & Events ───────────────────────────────────────────────────────
const metrics = new EventEmitter();

// ─── Semantic Cache ─────────────────────────────────────────────────────────
// Simple in-memory cache to avoid redundant calls for identical prompts.
const semanticCache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour

function getPromptHash(prompt) {
  return crypto.createHash('md5').update(prompt).digest('hex');
}

// ─── Configuration ───────────────────────────────────────────────────────────
const KEYS = [
  process.env.GEMINI_KEY1,
  process.env.GEMINI_KEY2,
  process.env.GEMINI_KEY3,
].filter(Boolean);

const MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001'
];

const DAILY_TOKEN_BUDGET = 950000; // Limit per key before switching to fallback (safety buffer for 1M)
const CIRCUIT_BREAKER_FAILURES = 5;
const COOLDOWN_BREAKER = 130 * 1000; // 130s longer cooldown for breaker trips
const RATE_LIMIT_COOLDOWN = 65 * 1000; // 65s for 429 errors

// ─── Key Performance Tracking ───────────────────────────────────────────────
const keyRegistry = KEYS.map(key => ({
  key,
  isBroken: false,
  failureCount: 0,
  cooldownUntil: 0,
  budgetUsed: 0,
  lastUsed: 0,
  errorRate: 0, // Exponential moving average of errors
  successCount: 0,
  totalRequests: 0
}));

// ─── Priority Queues ────────────────────────────────────────────────────────
// p-queue allows us to manage concurrency per priority lane.
const queues = {
  high:   new PQueue({ concurrency: 10 }), // Real-time chat
  normal: new PQueue({ concurrency: 5 }),  // Automatic tasks
  low:    new PQueue({ concurrency: 2 })   // Passive analysis
};

// ─── Weighted Selection Logic ────────────────────────────────────────────────
// Ranks keys based on health, reliability, and remaining budget.
function selectKey() {
  const now = Date.now();
  
  const candidates = keyRegistry.filter(k => {
    // Basic health check
    if (k.cooldownUntil > now) return false;
    if (k.budgetUsed >= DAILY_TOKEN_BUDGET) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Scoring algorithm: higher is better
  const scored = candidates.map(k => {
    const budgetWeight = (DAILY_TOKEN_BUDGET - k.budgetUsed) / DAILY_TOKEN_BUDGET;
    const reliabilityWeight = 1 - (k.errorRate / 10); // Penalty for recent errors
    const recencyWeight = (now - k.lastUsed) / 10000; // Bonus for not being used recently
    
    return { 
      data: k, 
      score: (budgetWeight * 40) + (reliabilityWeight * 30) + (recencyWeight * 20) 
    };
  });

  return scored.sort((a, b) => b.score - a.score)[0].data;
}

// ─── Utilities ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const estimateTokens = (text) => Math.ceil(text.length / 4);

// ─── API Communication ───────────────────────────────────────────────────────
async function execGeminiRequest(prompt, k, model) {
  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${k.key}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const latency = Date.now() - start;
    k.totalRequests++;
    k.lastUsed = Date.now();

    if (res.status === 429) {
      k.failureCount++;
      k.cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN;
      k.errorRate = (k.errorRate * 0.7) + 0.3; // Weight local spike
      metrics.emit('request', { key: k.key.slice(-6), model, latency, success: false, status: 429 });
      throw new Error('Rate limited');
    }

    if (!res.ok) {
      k.failureCount++;
      k.errorRate = (k.errorRate * 0.8) + 0.2;
      if (k.failureCount >= CIRCUIT_BREAKER_FAILURES) {
        k.cooldownUntil = Date.now() + COOLDOWN_BREAKER;
        console.warn(`[CircuitBreaker] Key ending ...${k.key.slice(-6)} tripped. Cooling down for 130s.`);
      }
      const errBody = await res.text().catch(() => 'Unknown Error');
      metrics.emit('request', { key: k.key.slice(-6), model, latency, success: false, status: res.status });
      throw new Error(`Gemini error ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    // Update budget and success metrics
    k.budgetUsed += estimateTokens(prompt + text);
    k.successCount++;
    k.failureCount = 0; // Reset breaker on success
    k.errorRate = k.errorRate * 0.5; // Quickly recover reliability score
    
    metrics.emit('request', { key: k.key.slice(-6), model, latency, success: true, status: 200 });
    return text;

  } catch (err) {
    const latency = Date.now() - start;
    if (!err.rateLimit) {
      metrics.emit('request', { key: k.key.slice(-6), model, latency, success: false, status: 'EXCEPTION' });
    }
    throw err;
  }
}

// ─── Main Dispatcher ────────────────────────────────────────────────────────
async function callWithOrchestration(prompt, priority = 'normal', retries = 3) {
  // 1. Check Semantic Cache
  const hash = getPromptHash(prompt);
  const cached = semanticCache.get(hash);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.text;
  }

  // 2. Queue for Execution
  const queue = queues[priority] || queues.normal;
  
  return queue.add(async () => {
    for (let attempt = 0; attempt < retries; attempt++) {
      const k = selectKey();
      const model = MODELS[attempt % MODELS.length];

      if (!k) {
        const waitTime = (attempt + 1) * 3000;
        await sleep(waitTime);
        continue;
      }

      try {
        const result = await execGeminiRequest(prompt, k, model);
        // Save to cache on success
        semanticCache.set(hash, { text: result, timestamp: Date.now() });
        return result;
      } catch (err) {
        if ((err.message.includes('Rate limited') || err.status === 429) && attempt < retries - 1) {
          continue; 
        }
        throw err;
      }
    }
    throw new Error('Jerry AI is temporarily exhausted across all neural pathways. Please wait.');
  });
}

// ── Public API — used by aiService.js ────────────────────────────────────────

const chatAI = (prompt) => callWithOrchestration(prompt, 'high');
const analysisAI = (prompt) => callWithOrchestration(prompt, 'normal');

module.exports = { chatAI, analysisAI, metrics };
