const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// POST /api/task
router.post('/', auth, taskController.handleTask);

module.exports = router;
