const express = require('express');
const router = express.Router();
const examModeController = require('../controllers/examModeController');
const auth = require('../middleware/auth');

// POST /api/exam-mode
router.post('/', auth, examModeController.toggleExamMode);

module.exports = router;
