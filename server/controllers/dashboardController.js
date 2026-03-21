const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const Memory = require('../models/Memory');
const taskService = require('../services/taskService');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;


    // 1. Get today's task status (pending/completed)
    const { pending, completed, log: todayLog } = await taskService.getTaskStatus(userId);
    const todayScore = todayLog ? todayLog.score : 0;

    // 2. Get Streak
    const streak = user.streak || 0;

    // 3. Get Last 7 Days Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysLogs = await DailyLog.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // 4. Get Weak Areas
    const weakAreas = await Memory.find({ userId, type: 'weakness' });
    const weaknesses = weakAreas.map(w => w.value);

    res.json({
      todayScore,
      streak,
      last7DaysLogs,
      pendingTasks: pending,
      completedTasks: completed,
      weaknesses: weaknesses.length ? weaknesses : user.weaknesses
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
