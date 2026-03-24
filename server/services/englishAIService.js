const { englishCoach } = require('../config/aiPrompts');

// ─── Dedicated English Analysis Service ────────────────────────────────────
// Uses specific English Gemini keys and a preferred model for audio analysis.

const KEYS = [
  process.env.ENGLISH_GEMINI_KEY1,
  process.env.ENGLISH_GEMINI_KEY2,
].filter(Boolean);

// Model controlled via .env → ENGLISH_GEMINI_MODEL
// e.g.  ENGLISH_GEMINI_MODEL=gemini-2.5-flash-lite
const PREFERRED_MODEL = process.env.ENGLISH_GEMINI_MODEL || 'gemini-2.0-flash';

const { callWithOrchestration } = require('./geminiService');

async function analyzeEnglishAudio(promptParts, userData) {
  const models = (process.env.ENGLISH_GEMINI_MODEL || 'gemini-2.0-flash')
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

  const fallbackModels = [...models, 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

  // Prepare the DB Snapshot block for the English Coach
  const dbContext = `
-----------------------------------
USER DB SNAPSHOT (CONTEXT):
- Name: ${userData?.user?.name || 'User'}
- Goal: ${userData?.user?.goal || 'N/A'}
- Recent Patterns: ${userData?.patterns?.join(', ') || 'None'}
- Streak: ${userData?.user?.streak || 0}
- Last Session Summary: ${userData?.lastSession ? JSON.stringify(userData.lastSession, null, 1) : 'First session'}
-----------------------------------
  `;

  const parts = [
    { text: englishCoach + "\n" + dbContext },
    ...promptParts.filter(p => !p.text) 
  ];

  try {
    // Leverage the unified orchestrator to use all 5 keys correctly
    return await callWithOrchestration(parts, 'normal', 5, fallbackModels);
  } catch (error) {
    console.error('[EnglishAI] Unified connection failed:', error.message);
    throw error;
  }
}

module.exports = { analyzeEnglishAudio };
