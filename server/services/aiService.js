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
exports.buildPrompt = (user, recentLogs, patterns, previousMessages, message, taskStatus) => {
  const profile = `User Profile:
Name: ${user.name}
Goal: ${user.goal}
Skills: ${(user.skills || []).join(', ')}
Weaknesses: ${(user.weaknesses || []).join(', ')}
Exam Mode: ${user.examMode}`;

  const logs = `Recent Activity (Last 7 Days):
${recentLogs.map((log, i) =>
  `Day ${i + 1}: Score ${log.score}, DSA Problems: ${log.dsa?.problems || 0}, Dev Mins: ${log.dev?.minutes || 0}, English Mins: ${log.english?.minutes || 0}`
).join('\n')}`;

  const status = taskStatus ? `Today's Task Status:
Pending: ${taskStatus.pending.map(p => p.title).join(', ') || 'None (All caught up!)'}
Completed: ${taskStatus.completed.map(c => c.title).join(', ') || 'None yet'}` : '';

  const memory = `Detected Patterns/Memories:
${patterns.map(p => `[${p.type}] ${p.value} (Freq: ${p.frequency})`).join('\n') || 'None yet.'}`;

  const history = previousMessages.length
    ? `Conversation History:\n${previousMessages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Jerry'}: ${m.content}`).join('\n')}`
    : '';

  const personality = `You are "Jerry - Personal AI Brain", a senior backend engineer and AI architect mentor.
Your goal is to guide the user to achieve their stated goals.
You are direct, structured, encouraging but firm.
Personalise every response using the user profile, recent activity, today's status, and detected patterns.
If the user asks about their tasks or status, use "Today's Task Status" to provide a detailed explanation and encouragement.
If Exam Mode is active, be extremely focused and shut down any off-topic distractions.
Always respond in a concise, structured manner.`;

  return [personality, profile, logs, status, memory, history, `User: ${message}`]
    .filter(Boolean)
    .join('\n\n');
};

// ── Main response generator ───────────────────────────────────────────────────
exports.generateResponse = async ({ user, recentLogs, patterns, message, previousMessages, extractedIntent, taskStatus }) => {
  try {
    const prompt = exports.buildPrompt(user, recentLogs, patterns, previousMessages, message, taskStatus);
    const response = await chatAI(prompt);
    return response;
  } catch (error) {
    console.error('[aiService] Gemini error:', error.message);

    if (/rate.?limited/i.test(error.message)) {
      return 'Jerry is currently overloaded. All AI keys are rate-limited — please try again in a moment.';
    }

    return 'Jerry is experiencing difficulties. Please try again later.';
  }
};

// ── Analysis helper (optional — use for summarisation tasks) ─────────────────
exports.analyseText = async (text) => {
  try {
    return await analysisAI(text);
  } catch (error) {
    console.error('[aiService] Analysis error:', error.message);
    throw error;
  }
};
