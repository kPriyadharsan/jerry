const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const Memory = require('../models/Memory');
const ChatHistory = require('../models/ChatHistory');
const EnglishSession = require('../models/EnglishSession');
const VoiceMistakeLog = require('../models/VoiceMistakeLog');
const UserTopicHistory = require('../models/UserTopicHistory');
const taskService = require('../services/tracking/task');
const aiRouter = require('../services/ai/router');
const intentService = require('../services/tracking/intent');
const { suggestNextTopics, PROGRESSION_TOPICS } = require('../services/ai/engines/topicSuggestion');

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const user = req.user;

    // 2. Fetch Last 7 Days Logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await DailyLog.find({ 
      userId, 
      date: { $gte: sevenDaysAgo } 
    }).sort({ date: -1 });

    // 3. Fetch Patterns/Memories
    const patterns = await Memory.find({ userId });

    // 4. Extract Meaning with DB context
    const intentData = await intentService.detectIntent(message, { user, recentLogs });
    const intent = intentData.intent; // e.g. 'dsa', 'english', etc.

    // 5. Fetch Chat History
    let chatHistory = await ChatHistory.findOne({ userId });
    if (!chatHistory) {
      chatHistory = new ChatHistory({ userId, messages: [] });
    }

    const previousMessages = chatHistory.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 6. Fetch Today's Task Status
    const taskStatus = await taskService.getTaskStatus(userId);

    // 7. Fetch Latest English session
    const lastEnglishSession = await EnglishSession.findOne({ userId }).sort({ createdAt: -1 });

    // 7b. Fetch recent voice practice mistake logs for Jerry context
    const voiceMistakeHistory = await VoiceMistakeLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 7c. Compute exact next recommended topic from engine
    const topicHistory = await UserTopicHistory.find({ userId }).sort({ lastPracticed: -1 }).lean();
    const topicSuggestions = await suggestNextTopics([], topicHistory, '');
    const recommendedNextTopic = topicSuggestions[0] || PROGRESSION_TOPICS[0];

    // 8. Call AI Router pipeline
    const userData = {
      user,
      recentLogs,
      patterns,
      taskStatus,
      lastEnglishSession,
      voiceMistakeHistory,
      recommendedNextTopic,
    };

    const aiResponse = await aiRouter({
      intent,
      message,
      userData,
      context: { previousMessages }
    });

    // 9. Save Chat
    chatHistory.messages.push({ role: 'user', content: message });
    chatHistory.messages.push({ role: 'assistant', content: aiResponse });
    await chatHistory.save();

    // 10. Return Response
    res.json({ response: aiResponse, intent: intentData });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      return res.json({ messages: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = (chatHistory.messages || []).filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate >= today;
    }).slice(-20);

    res.json({ messages: todayMessages });
  } catch (error) {
    console.error('Get Chat History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
