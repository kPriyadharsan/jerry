const DailyLog = require('../models/DailyLog');
const scoringService = require('../services/scoringService');
const patternService = require('../services/patternService');

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

    // Update fields - Incremental updates for counts/minutes
    if (dsa) {
      log.dsa.problems = (log.dsa.problems || 0) + (dsa.problems || 0);
      log.dsa.timeTaken = (log.dsa.timeTaken || 0) + (dsa.timeTaken || 0);
      if (dsa.platform) log.dsa.platform = dsa.platform;
      if (dsa.difficulty) log.dsa.difficulty = dsa.difficulty;
      if (dsa.topic?.length) log.dsa.topics = [...new Set([...(log.dsa.topics || []), ...dsa.topic])];
    }
    if (apps) {
      log.apps.topic = apps.topic || log.apps.topic;
      log.apps.hours = (log.apps.hours || 0) + (apps.hours || 0);
      log.apps.questions = (log.apps.questions || 0) + (apps.questions || 0);
      log.apps.score = apps.score || log.apps.score;
    }
    if (english) {
      log.english.topic = english.topic || log.english.topic;
      log.english.minutes = (log.english.minutes || 0) + (english.minutes || 0);
    }
    if (dev) {
      log.dev.project = dev.project || log.dev.project;
      log.dev.minutes = (log.dev.minutes || 0) + (dev.minutes || 0);
    }
    if (notes) log.notes = notes;

    // Recalculate Score based on total progress today
    log.score = scoringService.calculateScore(log);
    
    await log.save();

    // 3. Update Patterns
    await patternService.updatePatterns(userId);

    // 4. Return updated score
    res.json({ success: true, log: log, currentScore: log.score });

  } catch (error) {
    console.error('Task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
