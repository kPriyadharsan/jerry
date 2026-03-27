const VoiceMistakeLog  = require('../models/VoiceMistakeLog');
const UserTopicHistory = require('../models/UserTopicHistory');
const EnglishSession   = require('../models/EnglishSession');
const User             = require('../models/User');
const { analyzeGrammar }    = require('../services/ai/engines/grammarAnalysis');
const { suggestNextTopics } = require('../services/ai/engines/topicSuggestion');

/* ─────────────────────────────────────────────────────────────────
   POST /api/voice/analyze
   Full pipeline: grammar AI → save mistakes → topic suggestions
───────────────────────────────────────────────────────────────── */
exports.analyzeVoice = async (req, res) => {
  try {
    const { audioData, mimeType, duration, topic, topicId } = req.body;
    const userId = req.user.id;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const user = await User.findById(userId);

    // ── 1. Grammar Analysis AI ──────────────────────────────────
    const audioParts = [{
      inlineData: { mimeType: mimeType || 'audio/webm', data: audioData }
    }];

    const grammarResult = await analyzeGrammar(audioParts, {
      userName: user?.name || 'Student',
      topic:    topic || 'General Practice',
      duration: duration || 0,
    });

    // ── 2. Save Mistake Log to DB ───────────────────────────────
    let savedLog = null;
    try {
      savedLog = await VoiceMistakeLog.create({
        userId,
        topic:    topic || 'General Practice',
        mistakes: grammarResult.mistakes,
        score:    grammarResult.overallGrammarScore,
        duration: duration || 0,
      });
    } catch (e) {
      console.error('[VoiceCtrl] Failed to save mistake log:', e.message);
    }

    // ── 3. Fetch Topic History ──────────────────────────────────
    let topicHistory = [];
    try {
      topicHistory = await UserTopicHistory.find({ userId })
        .sort({ lastPracticed: -1 })
        .limit(20)
        .lean();
    } catch (e) {
      console.error('[VoiceCtrl] Failed to fetch topic history:', e.message);
    }

    // ── 4. Upsert current topic in history ─────────────────────
    if (topicId) {
      try {
        const existingHistory = await UserTopicHistory.findOne({ userId, topicId });
        if (existingHistory) {
          const prevAvg     = existingHistory.avgScore || 0;
          const prevCount   = existingHistory.sessionsCount || 1;
          const newAvg      = ((prevAvg * prevCount) + grammarResult.overallGrammarScore) / (prevCount + 1);
          const mergedAreas = [...new Set([...existingHistory.weakAreas, ...grammarResult.weakAreas])].slice(0, 5);
          await UserTopicHistory.findByIdAndUpdate(existingHistory._id, {
            sessionsCount:  prevCount + 1,
            lastPracticed:  new Date(),
            avgScore:       Math.round(newAvg),
            weakAreas:      mergedAreas,
          });
        } else {
          await UserTopicHistory.create({
            userId,
            topicId,
            topicName:     topic || 'General Practice',
            sessionsCount: 1,
            avgScore:      grammarResult.overallGrammarScore,
            weakAreas:     grammarResult.weakAreas,
          });
        }
      } catch (e) {
        console.error('[VoiceCtrl] Failed to upsert topic history:', e.message);
      }
    }

    // ── 5. Next Topic Suggestions ───────────────────────────────
    const nextTopics = await suggestNextTopics(
      grammarResult.weakAreas,
      topicHistory,
      topicId || '',
    );

    // ── 6. Build Jerry Context (recent mistakes for chatbot) ────
    const recentMistakeLogs = await VoiceMistakeLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const jerryContext = buildJerryContext(user, recentMistakeLogs);

    return res.json({
      success:        true,
      transcription:  grammarResult.transcription,
      mistakes:       grammarResult.mistakes,
      weakAreas:      grammarResult.weakAreas,
      grammarScore:   grammarResult.overallGrammarScore,
      nextTopics,
      jerryContext,
      mistakeLogId:   savedLog?._id || null,
    });

  } catch (err) {
    console.error('[VoiceCtrl] Critical error in analyzeVoice:', err);
    res.status(500).json({ error: 'Voice analysis failed. Please try again.' });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/voice/mistakes
   Returns recent mistake logs for Jerry chatbot context
───────────────────────────────────────────────────────────────── */
exports.getMistakeLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit  = parseInt(req.query.limit) || 10;

    const logs = await VoiceMistakeLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ logs });
  } catch (err) {
    console.error('[VoiceCtrl] getMistakeLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch mistake logs' });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/voice/topics
   Returns user's topic history
───────────────────────────────────────────────────────────────── */
exports.getTopicHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await UserTopicHistory.find({ userId })
      .sort({ lastPracticed: -1 })
      .lean();
    res.json({ history });
  } catch (err) {
    console.error('[VoiceCtrl] getTopicHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch topic history' });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/voice/next-topic
   Returns the highest priority next topic based on history
───────────────────────────────────────────────────────────────── */
exports.getNextTopic = async (req, res) => {
  try {
    const userId = req.user.id;
    const topicHistory = await UserTopicHistory.find({ userId }).sort({ lastPracticed: -1 }).lean();
    const suggestions = await suggestNextTopics([], topicHistory, '');
    res.json({ nextTopic: suggestions[0] || require('../services/ai/engines/topicSuggestion').PROGRESSION_TOPICS[0] });
  } catch (err) {
    console.error('[VoiceCtrl] getNextTopic error:', err);
    res.status(500).json({ error: 'Failed to fetch next topic', nextTopic: require('../services/ai/engines/topicSuggestion').PROGRESSION_TOPICS[0] });
  }
};

/* ─────────────────────────────────────────────────────────────────
   Helper: Build Jerry chatbot context string from mistake history
───────────────────────────────────────────────────────────────── */
function buildJerryContext(user, mistakeLogs) {
  if (!mistakeLogs || mistakeLogs.length === 0) {
    return '';
  }

  const lines = mistakeLogs.map(log => {
    const date = new Date(log.createdAt).toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    const top3 = (log.mistakes || []).slice(0, 3).map(m =>
      `"${m.wrongPhrase}" → "${m.correctPhrase}" (${m.grammarRule})`
    ).join('; ');
    return `[${date}] Topic: ${log.topic} | Mistakes: ${top3 || 'None'}`;
  }).join('\n');

  return `
Voice Practice Mistake History for ${user?.name || 'Student'}:
${lines}

Weak Areas (recurring): ${[...new Set(mistakeLogs.flatMap(l => l.mistakes?.map(m => m.grammarRule) || []))].slice(0, 5).join(', ')}
`;
}
