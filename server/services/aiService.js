const { chatAI, analysisAI } = require('./geminiService');

// ── Meaning extraction (rule-based, no AI needed) ────────────────────────────
exports.extractMeaning = async (text) => {
  const intent = { action: 'chat', topics: [] };
  const lower = text.toLowerCase();

  if (lower.includes('dsa') || lower.includes('leetcode'))                   intent.topics.push('dsa');
  if (lower.includes('english') || lower.includes('grammar'))                intent.topics.push('english');
  if (lower.includes('dev') || lower.includes('build') || lower.includes('project')) intent.topics.push('dev');
  if (lower.includes('apps') || lower.includes('aptitude'))                  intent.topics.push('apps');

  return intent;
};

// ── Prompt builder ───────────────────────────────────────────────────────────
// ── Adaptive Tier Calculation ────────────────────────────────────────────────
const calculateUserLevel = (recentLogs, streak) => {
  const last5Days = (recentLogs || []).slice(0, 5);
  const activeDays = last5Days.filter(log => (log.dsa?.problems > 0 || log.english?.minutes > 0 || log.dev?.minutes > 0)).length;
  
  // Independent DSA performance check
  const independentSolvedCount = last5Days.filter(log => log.dsa?.problems > 0 && log.dsa?.solvedWithoutHelp).length;

  if (activeDays >= 5 && independentSolvedCount >= 2) return 'PRO';
  if (activeDays >= 4) return 'PERFORMER';
  if (activeDays >= 2) return 'LEARNER';
  return 'FRESHER';
};

// ── Prompt builder ───────────────────────────────────────────────────────────
exports.buildPrompt = (user, recentLogs, patterns, previousMessages, message, taskStatus, lastEnglishSession, extractedIntent) => {
  const safeLogs = recentLogs || [];
  const todayLog = safeLogs[0] || {};
  const past5Summary = safeLogs.slice(1, 6);
  const userLevel = calculateUserLevel(safeLogs, user?.streak || 0);

  const contextData = {
    detectedMode: (extractedIntent?.topics || []).join(', ') || 'General Chat',
    level: userLevel,
    today: {
      date: new Date().toDateString(),
      dsa: todayLog.dsa || { problems: 0, solvedWithoutHelp: false },
      aptitude: todayLog.aptitude || { topics: [] },
      english: todayLog.english || { minutes: 0 },
      dev: todayLog.dev || { minutes: 0 }
    },
    history5Day: past5Summary.map(log => ({
      score: log.score,
      dsa: log.dsa?.problems,
      solvedWithoutHelp: log.dsa?.solvedWithoutHelp,
      dev: log.dev?.minutes,
      date: log.date?.toISOString().split('T')[0]
    })),
    patterns: (patterns || []).map(p => `[${p.type}] ${p.value} (${p.frequency})`),
    tasks: taskStatus || { pending: [], completed: [] },
    english: lastEnglishSession ? {
      score: lastEnglishSession.overall,
      feedback: lastEnglishSession.feedback,
      improve: lastEnglishSession.improve
    } : null
  };

  const systemInstructions = `You are an adaptive AI mentor system designed to track, analyze, and evolve a user's performance daily.

Your current personality must reflect the user's progress level.
CURRENT USER LEVEL: ${userLevel}
DETECTED INTENT MODE: ${contextData.detectedMode}

-----------------------------------
🎯 CORE BEHAVIOR
-----------------------------------
1. Always act like a personal mentor who:
   - Tracks daily activities
   - Analyzes performance
   - Gives structured feedback
   - Suggests next improvements

2. Your tone must evolve:
   - Beginner (FRESHER) → Simple, supportive, explanatory
   - Intermediate (LEARNER/PERFORMER) → Analytical, structured, slightly challenging
   - Advanced (PRO) → Strategic, concise, high-level, assumes expertise

-----------------------------------
 USER PROFILING SYSTEM
-----------------------------------
User Tiers:
- FRESHER → little or no consistency, weak fundamentals
- LEARNER → improving, building basics, moderate consistency
- PERFORMER → consistent, solving problems, gaining confidence
- PRO → high consistency, strong performance, strategic thinking

----------------------------------
 MODE-SPECIFIC LOGIC
-----------------------------------
- DAILY SUMMARY: When asked "What did I do today?", provide Task Summary, Performance Analysis, Behavioral Insight, and Improvement Suggestions.
- DSA ANALYSIS: For problems (e.g. "problem 27"), identify topic, evaluate mastery, note mistake patterns, and suggest difficulty progression.
- APTITUDE: Analyze concepts, accuracy/speed, weak areas, and give a specific next-day plan.
- ENGLISH: Analyze grammar, vocabulary, sentence formation. Provide corrected examples and specific practice tasks.
- DEVELOPMENT: Provide practical feedback on code/design, industry-level suggestions, and next feature ideas.

-----------------------------------
 STRICT RULES
-----------------------------------
- Never give generic advice.
- Always refer to the User Context Data provided below.
- Always be structured with Sections and Bullet points.
- Always include a next actionable step.
- Keep responses clear, punchy, and insightful.

-----------------------------------
🧠 USER CONTEXT DATA
-----------------------------------
### 👤 Profile
Name: ${user?.name || 'User'}
Goal: ${user?.goal || 'Crack a tech job'}

### 📈 Predicted Level: ${userLevel}
### 📊 Today's Activity
${JSON.stringify(contextData.today, null, 2)}

### 📅 Last 5 Days Performance
${JSON.stringify(contextData.history5Day, null, 2)}

### 🧠 Memory/Patterns
${contextData.patterns.join('\n') || 'None yet'}

### 📅 Today's Real Task Status
- Pending: ${contextData.tasks.pending.map(t => t.title).join(', ') || 'None'}
- Completed: ${contextData.tasks.completed.map(t => t.title).join(', ') || 'None'}

### 🗣️ Latest English Feedback
${contextData.english ? JSON.stringify(contextData.english, null, 2) : 'No recent sessions.'}

-----------------------------------
💬 CONVERSATION HISTORY
${previousMessages.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content}`).join('\n')}
`;

  return systemInstructions + `\n\nUser: ${message}`;
};

// ── Main response generator ───────────────────────────────────────────────────
exports.generateResponse = async ({ user, recentLogs, patterns, message, previousMessages, extractedIntent, taskStatus, lastEnglishSession }) => {
  try {
    const prompt = exports.buildPrompt(user, recentLogs, patterns, previousMessages, message, taskStatus, lastEnglishSession, extractedIntent);
    const response = await chatAI(prompt);
    return response;
  } catch (error) {
    console.error('[aiService] Mentorship link failure:', error.message);
    return `Mentor Jerry is recalibrating your strategy. High traffic detected in the neural link. Please try again in 10 seconds.`;
  }
};

// ── Analysis helper ──────────────────────────────────────────────────────────
exports.analyseText = async (text) => {
  try {
    return await analysisAI(text);
  } catch (error) {
    console.error('[aiService] Analysis error:', error.message);
    throw error;
  }
};

