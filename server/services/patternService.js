const DailyLog = require('../models/DailyLog');
const Memory = require('../models/Memory');

exports.updatePatterns = async (userId) => {
  try {
    // Get last 7 days of logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await DailyLog.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    if (recentLogs.length === 0) return;

    // Pattern 1: Skipping English for 3+ days
    let englishSkippedCount = 0;
    for (let i = 0; i < Math.min(recentLogs.length, 3); i++) {
      if (!recentLogs[i].english || !recentLogs[i].english.minutes) {
        englishSkippedCount++;
      }
    }

    if (englishSkippedCount === 3) {
      await Memory.findOneAndUpdate(
        { userId, type: 'weakness', value: 'Needs consistency in English practice' },
        { $inc: { frequency: 1 } },
        { upsert: true, new: true }
      );
    }

    // Pattern 2: Low total score / Low DSA Score
    let consecutiveLowDsa = 0;
    for (let i = 0; i < Math.min(recentLogs.length, 2); i++) {
        // Assume under 15 points in DSA is low
        const dsaPoints = (recentLogs[i].dsa && recentLogs[i].dsa.problems) ? (recentLogs[i].dsa.problems * 10) : 0;
        if (dsaPoints < 15) {
            consecutiveLowDsa++;
        }
    }

    if (consecutiveLowDsa >= 2) {
      await Memory.findOneAndUpdate(
        { userId, type: 'pattern', value: 'DSA consistency dropping' },
        { $inc: { frequency: 1 } },
        { upsert: true, new: true }
      );
    }
    
  } catch (error) {
    console.error('Error updating patterns:', error);
  }
};
