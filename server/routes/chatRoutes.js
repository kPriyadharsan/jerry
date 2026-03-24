const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// POST /api/chat
router.post('/', auth, chatController.handleChat);
router.get('/history', auth, chatController.getChatHistory);

module.exports = router;
