const chatAI = require('./chatAI');
const analysisAI = require('./analysisAI');
const planningAI = require('./planningAI');

async function aiRouter({ intent, message, userData, context }) {
  const pastDaysLogs = userData.recentLogs || [];

  // 1. Build common app context
  const appContext = {
    userName: userData.user?.name || 'User',
    userProfile: {
      goal: userData.user?.goal || 'No goal set',
      skills: userData.user?.skills || [],
      weaknesses: userData.user?.weaknesses || [],
      examMode: userData.user?.examMode || false,
    },
    streak: userData.user?.streak || 0,
    currentTime: new Date().toISOString(),
    todayDate: new Date().toDateString(),
    tasks: {
      pending: userData.taskStatus?.pending?.map(t => t.title) || [],
      completed: userData.taskStatus?.completed?.map(t => t.title) || []
    }
  };

  // 1.5. ALWAYS include today's detailed summary to prevent AI "dumbness"
  const latestLog = pastDaysLogs[0];
  if (latestLog) {
    appContext.todayDetailedSummary = {
      dsa: {
        platform: latestLog.dsa?.platform || 'Unknown',
        topics: latestLog.dsa?.topics || [],
        problems: latestLog.dsa?.problems || 0,
        problemIdentifiers: latestLog.dsa?.problemIdentifiers || [],
        difficulty: latestLog.dsa?.difficulty || 'N/A',
        timeTaken: latestLog.dsa?.timeTaken || 0,
        solvedWithoutHelp: latestLog.dsa?.solvedWithoutHelp || false
      },
      english: {
        topic: latestLog.english?.topic || 'N/A',
        minutes: latestLog.english?.minutes || 0,
        avgOverallScore: latestLog.english?.avgOverallScore || 0,
        sessionsCount: latestLog.english?.sessionsCount || 0
      },
      dev: {
        project: latestLog.dev?.project || 'N/A',
        minutes: latestLog.dev?.minutes || 0
      },
      aptitude: {
        topic: latestLog.apps?.topic || 'N/A',
        hours: latestLog.apps?.hours || 0,
        questions: latestLog.apps?.questions || 0,
        score: latestLog.apps?.score || 0
      },
      notes: latestLog.notes || '',
      dailyScore: latestLog.score || 0,
      logDate: new Date(latestLog.date).toDateString()
    };
  }

  // 2. Comprehensive Data Synchronization: Provide 100% of available DB history for the last 7 days
  appContext.completeHistory = pastDaysLogs.map(log => ({
    date: new Date(log.date).toDateString(),
    dsa: log.dsa || {},
    english: log.english || {},
    dev: log.dev || {},
    aptitude: log.apps || {},
    notes: log.notes || '',
    dailyScore: log.score || 0
  }));

  // Preserve patterns/memories for long-term context
  if (userData.patterns && userData.patterns.length > 0) {
    appContext.memoryPatterns = userData.patterns;
  }
  appContext.lastEnglishSession = userData.lastEnglishSession || null;

  // Intent is now primarily used for routing heavy analysis, not for filtering information.
  const msgLower = (message || '').toLowerCase();
  const needsPlan = msgLower.includes('plan') || msgLower.includes('next');

  if (needsPlan || ['analysis', 'dsa', 'english', 'development', 'aptitude'].includes(intent)) {
    const analysis = await analysisAI(appContext, intent);
    const plan = await planningAI(analysis, intent, appContext);

    return await chatAI({
      message,
      plan,
      context,
      appContext,
      intent
    });
  }

  return await chatAI({ message, context, appContext, intent });
}

module.exports = aiRouter;
