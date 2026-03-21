const express = require('express');
const router = express.Router();
const { chatAI, analysisAI } = require('../services/geminiService');

// POST /api/gemini/chat
router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const text = await chatAI(prompt);
    res.json({ text });
  } catch (err) {
    console.error('[/api/gemini/chat]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gemini/analysis
router.post('/analysis', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const text = await analysisAI(prompt);
    res.json({ text });
  } catch (err) {
    console.error('[/api/gemini/analysis]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
