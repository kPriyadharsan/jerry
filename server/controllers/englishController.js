const EnglishSession = require('../models/EnglishSession');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const { analyzeEnglishAudio } = require('../services/englishAIService');
const scoringService = require('../services/scoringService');
const streakService = require('../services/streakService');

exports.analyzeAudio = async (req, res) => {
  try {
    const { audioData, mimeType, duration } = req.body;
    const userId = req.user.id;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const audioPart = [
      {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audioData
        }
      }
    ];

    // 1. Gather all DB context for English AI
    const user = req.user;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await DailyLog.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: -1 });
    const patterns = await Memory.find({ userId });
    const lastSession = await EnglishSession.findOne({ userId }).sort({ createdAt: -1 });

    const userData = {
      user: {
        name: user.name,
        goal: user.goal,
        skills: user.skills,
        weaknesses: user.weaknesses,
        streak: user.streak
      },
      recentLogs: recentLogs.map(l => ({ date: l.date, overall: l.english?.avgOverallScore || 0 })),
      patterns: patterns.map(p => `[${p.type}] ${p.value}`),
      lastSession
    };

    let rawResponse;
    try {
      rawResponse = await analyzeEnglishAudio(audioPart, userData);
    } catch (aiError) {
      console.error('Dedicated English Analysis AI failed:', aiError.message);
      rawResponse = null; // Signal fallback
    }
    
    // Parse JSON safely
    let resultJSON;
    if (!rawResponse) {
       resultJSON = {
        overall: 0, fluency: 0, clarity: 0, vocabulary: 0, grammar: 0,
        feedback: "Jerry's neural link was momentarily unstable. This usually happens with very short recordings, background noise, or high server load. Please try speaking for at least 5-10 seconds!",
        strength: "Retry recommended",
        improve: "Check audio length"
      };
    } else {
      try {
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        resultJSON = JSON.parse(cleaned);
        
        // Ensure scores are valid numbers
        ['fluency', 'clarity', 'vocabulary', 'grammar', 'overall'].forEach(key => {
          resultJSON[key] = Number(resultJSON[key]) || 0;
        });
      } catch (parseError) {
        console.error('Failed to parse Gemini response', { rawResponse, error: parseError.message });
        resultJSON = {
          overall: 0, fluency: 0, clarity: 0, vocabulary: 0, grammar: 0,
          feedback: "Jerry analyzed your speech but had trouble formatting the report. Please try again or speak more clearly!",
          strength: "Unclear data",
          improve: "Try again"
        };
      }
    }

    // Save to EnglishSession
    try {
      const session = new EnglishSession({
        userId,
        ...resultJSON
      });
      await session.save();
    } catch (saveError) {
      console.error('Failed to save session, but still returning results:', saveError.message);
    }

    // Minor sync up with DailyLog
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let log = await DailyLog.findOne({ userId, date: { $gte: today } });
      if (!log) {
        log = new DailyLog({ userId, date: new Date(), dsa: { topics: [] }, apps: {}, english: {}, dev: {} });
      }
      const minsDone = Math.max(1, Math.ceil((duration || 0) / 60));
      log.english.minutes = (log.english.minutes || 0) + minsDone;
      
      // Update average score
      const currentCount = log.english.sessionsCount || 0;
      const currentAvg = log.english.avgOverallScore || 0;
      log.english.avgOverallScore = ((currentAvg * currentCount) + resultJSON.overall) / (currentCount + 1);
      log.english.sessionsCount = currentCount + 1;

      log.score = scoringService.calculateScore(log);
      
      await log.save();

      // Update streak
      const updatedUser = await streakService.updateUserStreak(await User.findById(userId));
      resultJSON.latestStreak = updatedUser.streak;
      resultJSON.currentDailyScore = log.score;


    } catch (logError) {
      console.error('Daily log sync error:', logError.message);
    }

    return res.json(resultJSON);

  } catch (error) {
    console.error('Critical English practice analyze error:', error);
    res.status(500).json({ error: 'Critical failure during analysis' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await EnglishSession.find({ userId }).sort({ createdAt: 1 }).limit(10);
    
    // Map sessions to simple format for frontend
    const mappedSessions = sessions.map(s => ({
      date: s.date.toISOString().split('T')[0],
      fluency: s.fluency,
      clarity: s.clarity,
      vocabulary: s.vocabulary,
      grammar: s.grammar,
      overall: s.overall,
      feedback: s.feedback,
      strength: s.strength,
      improve: s.improve
    }));
    
    res.json({ sessions: mappedSessions });
  } catch (error) {
    console.error('English practice get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
