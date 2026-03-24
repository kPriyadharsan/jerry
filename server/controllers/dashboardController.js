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

    const streakService = require('../services/streakService');
    const User = require('../models/User');
    let freshUser = await User.findById(userId);
    
    // Auto-initialize streak if they have activity today but logic hasn't run yet
    if (todayScore > 0 && !freshUser.lastActiveDate) {
      freshUser = await streakService.updateUserStreak(freshUser);
    }

    const streak = streakService.getCurrentStreak(freshUser);

    // 3. Get Last 7 Days Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysLogs = await DailyLog.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // 4. Get Weak Areas & Pattern Insights
    const memories = await Memory.find({ userId }).sort({ frequency: -1 }).limit(5);
    const weaknesses = memories.filter(m => m.type === 'weakness').map(w => w.value);
    const patterns = memories.filter(m => m.type === 'pattern').map(p => p.value);

    // Build a summary insight string
    let patternInsights = "Jerry is refining your neural path...";
    if (patterns.length > 0 || weaknesses.length > 0) {
      const topIssue = weaknesses[0] || patterns[0];
      patternInsights = `Currently optimizing: ${topIssue}. ${patterns.length > 1 ? `Detected ${patterns.length} key performance trends.` : 'Keep maintaining consistency.'}`;
    }

    res.json({
      todayScore,
      streak,
      last7DaysLogs,
      pendingTasks: pending,
      completedTasks: completed,
      weaknesses: weaknesses.length ? weaknesses : (user.weaknesses || []),
      patternInsights: patternInsights
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
