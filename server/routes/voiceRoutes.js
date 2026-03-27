const express    = require('express');
const router     = express.Router();
const voice      = require('../controllers/voiceController');
const auth       = require('../middleware/auth');

// POST /api/voice/analyze  — main pipeline (audio → grammar AI → mistakes → topics)
router.post('/analyze', auth, express.json({ limit: '100mb' }), voice.analyzeVoice);

// GET  /api/voice/mistakes — fetch mistake history (for Jerry context)
router.get('/mistakes', auth, voice.getMistakeLogs);

// GET  /api/voice/topics   — fetch topic history
router.get('/topics', auth, voice.getTopicHistory);

// GET  /api/voice/next-topic — fetch recommended next topic
router.get('/next-topic', auth, voice.getNextTopic);

module.exports = router;
