const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const Memory = require('../models/Memory');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');
const taskService = require('../services/taskService');

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

    // 4. Extract Meaning
    const extractedIntent = await aiService.extractMeaning(message);

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

    // 7. Build Prompt and Call Gemini
    const aiResponse = await aiService.generateResponse({
      user,
      recentLogs,
      patterns,
      message,
      previousMessages,
      extractedIntent,
      taskStatus
    });

    // 8. Save Chat
    chatHistory.messages.push({ role: 'user', content: message });
    chatHistory.messages.push({ role: 'assistant', content: aiResponse });
    await chatHistory.save();

    // 9. Return Response
    res.json({ response: aiResponse, intent: extractedIntent });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
