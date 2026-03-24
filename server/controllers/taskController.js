const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const scoringService = require('../services/scoringService');
const patternService = require('../services/patternService');
const streakService = require('../services/streakService');

exports.handleTask = async (req, res) => {
  try {
    const { dsa, apps, english, dev, notes } = req.body;
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({ userId, date: { $gte: today } });

    if (!log) {
      log = new DailyLog({
        userId,
        date: new Date(),
        dsa: { topics: [] },
        apps: {},
        english: {},
        dev: {},
        notes: ''
      });
    }

    // Update fields - Smart merging for logs
    if (dsa) {
      log.dsa.problems = (log.dsa.problems || 0) + (dsa.problems || 0);
      log.dsa.timeTaken = (log.dsa.timeTaken || 0) + (dsa.timeTaken || 0);
      if (dsa.platform) log.dsa.platform = dsa.platform;
      if (dsa.difficulty) log.dsa.difficulty = dsa.difficulty;
      if (dsa.solvedWithoutHelp !== undefined) log.dsa.solvedWithoutHelp = dsa.solvedWithoutHelp;
      
      if (dsa.topic?.length) {
        log.dsa.topics = [...new Set([...(log.dsa.topics || []), ...dsa.topic])];
      }
      if (dsa.problemIdentifiers?.length) {
        log.dsa.problemIdentifiers = [...new Set([...(log.dsa.problemIdentifiers || []), ...dsa.problemIdentifiers])];
      }
    }

    if (apps) {
      if (apps.topic) log.apps.topic = apps.topic;
      log.apps.hours = (log.apps.hours || 0) + (apps.hours || 0);
      log.apps.questions = (log.apps.questions || 0) + (apps.questions || 0);
      if (apps.score !== undefined) log.apps.score = apps.score;
    }

    if (english) {
      if (english.topic) log.english.topic = english.topic;
      log.english.minutes = (log.english.minutes || 0) + (english.minutes || 0);
    }

    if (dev) {
      if (dev.project) log.dev.project = dev.project;
      log.dev.minutes = (log.dev.minutes || 0) + (dev.minutes || 0);
    }

    if (notes !== undefined) log.notes = notes;

    // Recalculate Score based on total progress today
    log.score = scoringService.calculateScore(log);
    
    await log.save();

    // 3. Update Patterns
    await patternService.updatePatterns(userId);

    const updatedUser = await streakService.updateUserStreak(await User.findById(userId));

    // 4. Return updated score and streak
    res.json({ 
      success: true, 
      log: log, 
      currentScore: log.score,
      streak: updatedUser.streak
    });

  } catch (error) {
    console.error('Task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
