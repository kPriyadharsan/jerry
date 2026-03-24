const express = require('express');
const router = express.Router();
const englishController = require('../controllers/englishController');
const auth = require('../middleware/auth');

// POST /api/english/analyze
router.post('/analyze', auth, express.json({ limit: '100mb' }), englishController.analyzeAudio);

// GET /api/english/history
router.get('/history', auth, englishController.getHistory);

module.exports = router;
