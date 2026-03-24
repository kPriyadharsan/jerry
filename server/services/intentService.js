const { chatAI } = require('./geminiService');

const cache = new Map();

// Layer 1: Basic Keyword Matching
const LAYER_1_RULES = [
  { intent: 'dsa', keywords: ['dsa', 'leetcode', 'array', 'string', 'tree', 'graph', 'algorithm', 'coding', 'solved', 'problems'] },
  { intent: 'english', keywords: ['english', 'grammar', 'vocab', 'vocabulary', 'speaking'] },
  { intent: 'aptitude', keywords: ['aptitude', 'quant', 'reasoning', 'puzzle'] },
  { intent: 'development', keywords: ['build', 'project', 'dev', 'app', 'react', 'node', 'web'] },
];

// Layer 2: Smart Pattern Matching
const LAYER_2_RULES = [
  { intent: 'dsa', patterns: ['solved problems', 'practice questions', 'coding question', 'how many problems', 'what did i solve', 'solved today'] },
  { intent: 'english', patterns: ['speaking', 'fluency', 'communication', 'spoken english'] },
  { intent: 'development', patterns: ['built app', 'created project', 'made a website'] },
];

/**
 * Detects the intent of a message using a fast rule-based approach,
 * falling back to an AI call that returns BOTH the intent and response together.
 * 
 * @param {string} message - User's message
 * @returns {Promise<{ intent: string, source: string, response: string|null }>}
 */
exports.detectIntent = async (message, contextData = {}) => {
  if (!message || typeof message !== 'string') {
    return { intent: 'general', source: 'rule', response: null };
  }

  const { user, recentLogs } = contextData;
  const lowerMsg = message.toLowerCase().trim();

  // 1. Check Cache
  if (cache.has(lowerMsg)) {
    return cache.get(lowerMsg);
  }

  // 2. Layer 1 (Fast Path)
  for (const rule of LAYER_1_RULES) {
    if (rule.keywords.some(kw => lowerMsg.includes(kw))) {
      const result = { intent: rule.intent, source: 'rule', response: null };
      cache.set(lowerMsg, result);
      return result;
    }
  }

  // 3. Layer 2 (Extended Rules)
  for (const rule of LAYER_2_RULES) {
    if (rule.patterns.some(pt => lowerMsg.includes(pt))) {
      const result = { intent: rule.intent, source: 'rule', response: null };
      cache.set(lowerMsg, result);
      return result;
    }
  }

  // 4. Layer 3: AI-Based Fallback (Only if meaningful length)
  if (message.length > 10) {
    try {
      const prompt = `
You are an intelligent AI mentor system.

CONTEXT SNAPSHOT FROM DB:
- User: ${user?.name || 'User'}
- Goal: ${user?.goal || 'N/A'}
- Recent Score: ${recentLogs?.[0]?.score || 0}
- Detected Patterns: ${user?.skills?.join(', ') || 'None'}

Analyze the user message and return STRICT JSON:

{
  "intent": "dsa | english | development | aptitude | general",
  "confidence": 0-1,
  "response": "your helpful response specifically addressing their profile"
}

Rules:
- Always return valid JSON
- Do not include explanations outside JSON
- Keep response helpful and short

User message: "${message}"
`;

      const aiResponseText = await chatAI(prompt);
      
      // Clean JSON if Gemini wrapped it in markdown code blocks
      const cleanJson = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleanJson);
      
      const result = {
        intent: aiData.intent || 'general',
        source: 'ai',
        response: aiData.response || null
      };

      // Store in cache
      cache.set(lowerMsg, result);
      return result;
    } catch (e) {
      console.error('[intentService] AI Fallback failed:', e.message);
      // On parsing failure or network error, fallback to safe defaults below
    }
  }

  // Final catch-all fallback
  const fallbackResult = { intent: 'general', source: 'rule', response: null };
  cache.set(lowerMsg, fallbackResult);
  return fallbackResult;
};
