const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const DailyLog = require('./models/DailyLog');
const Memory = require('./models/Memory');
const ChatHistory = require('./models/ChatHistory');
const EnglishSession = require('./models/EnglishSession');

// Mock req and res
const req = {
  user: { id: '69bea81b1b4b14b1fb95c402' }, // SaiPallavi ID from previous check
  body: { message: 'What do you know about me?' }
};

async function diagnostic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
        console.log('User not found in DB!');
        return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await DailyLog.find({ 
      userId, 
      date: { $gte: sevenDaysAgo } 
    }).sort({ date: -1 });

    const patterns = await Memory.find({ userId });
    
    let chatHistory = await ChatHistory.findOne({ userId });
    const previousMessages = chatHistory ? chatHistory.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })) : [];

    const taskStatus = { pending: [], completed: [] }; // mocked
    const lastEnglishSession = await EnglishSession.findOne({ userId }).sort({ createdAt: -1 });

    const userData = {
      user,
      recentLogs,
      patterns,
      taskStatus,
      lastEnglishSession
    };

    // Construct common app context (Logic from aiRouter.js)
    const appContext = {
        userName: userData.user?.name || 'User',
        userProfile: {
          goal: userData.user?.goal || 'No goal set',
          skills: userData.user?.skills || [],
          weaknesses: userData.user?.weaknesses || [],
        },
        streak: userData.user?.streak || 0,
        currentTime: new Date().toISOString(),
        todayDate: new Date().toDateString(),
        tasks: {
          pending: userData.taskStatus?.pending?.map(t => t.title) || [],
          completed: userData.taskStatus?.completed?.map(t => t.title) || []
        }
    };

    const latestLog = recentLogs[0];
    if (latestLog) {
        appContext.todayDetailedSummary = {
          dsa: latestLog.dsa || {},
          english: latestLog.english || {},
          dev: latestLog.dev || {},
          aptitude: latestLog.apps || {},
          notes: latestLog.notes || '',
          logDate: new Date(latestLog.date).toDateString()
        };
    }

    appContext.completeHistory = recentLogs.map(log => ({
        date: new Date(log.date).toDateString(),
        dsa: log.dsa || {},
        english: log.english || {},
        dev: log.dev || {},
        aptitude: log.apps || {},
        notes: log.notes || '',
        dailyScore: log.score || 0
    }));

    // Build Prompt (Logic from chatAI.js)
    let inputDataBlock = "No activity logs found.";
    if (appContext) {
        const today = appContext.todayDetailedSummary || {};
        const dsa = today.dsa || {};
        const english = today.english || {};
        const dev = today.dev || {};
        const aptitude = today.aptitude || {};
        const history = appContext.completeHistory || [];
        const profile = appContext.userProfile || {};
        
        inputDataBlock = `
- User Profile:
  * Name: ${appContext.userName}
  * Career Goal: ${profile.goal || 'N/A'}
  * Skills: ${profile.skills?.join(', ') || 'None'}
  * Weaknesses: ${profile.weaknesses?.join(', ') || 'None'}

- Latest/Today's Activity Log:
  * DSA: ${dsa.problems || 0} problems (${dsa.problemIdentifiers?.join(', ') || 'No IDs'}) on ${dsa.platform || 'N/A'}. [Independent: ${dsa.solvedWithoutHelp || false}]
  * English: ${english.minutes || 0} mins (${english.topic || 'N/A'}).
  * Aptitude: ${aptitude.hours || 0} hours (${aptitude.topic || 'N/A'}).
  * Development: ${dev.minutes || 0} mins (Project: ${dev.project || 'N/A'}).
  * Daily Notes: ${today.notes || 'No notes.'}

- Full Performance History (Last 7 Logs):
${history.map(h => {
  return `  * ${h.date}: DSA(${h.dsa?.problems || 0} probs), English(${h.english?.minutes || 0}m), Dev(${h.dev?.minutes || 0}m), Score(${h.dailyScore}).`;
}).join('\n')}
        `;
    }

    console.log('--- FINAL PROMPT INPUT BLOCK ---');
    console.log(inputDataBlock);
    console.log('--- END ---');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Diagnostic error:', err);
  }
}

diagnostic();
