const aiRouter = require('./services/ai/aiRouter');
const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  try {
    const userData = {
      user: { name: 'SaiPallavi', goal: 'Test Goal', skills: ['JS'], weaknesses: ['DSA'], streak: 5, examMode: false },
      recentLogs: [],
      patterns: [],
      taskStatus: { pending: [], completed: [] },
      lastEnglishSession: null
    };

    console.log('Testing aiRouter with intent: general');
    const response = await aiRouter({
      intent: 'general',
      message: 'Hello Jerry',
      userData,
      context: { previousMessages: [] }
    });

    console.log('Response received:', response);
  } catch (err) {
    console.error('CRITICAL ERROR:', err.stack);
  }
}

test();
