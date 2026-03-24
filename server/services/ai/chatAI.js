const { chatAI: geminiChatAI } = require('../geminiService');

async function chatAI({ message, plan, context, appContext, intent }) {
  // Construct the exact INPUT DATA block with 100% DB awareness
  let inputDataBlock = "No activity logs found.";
  let profile = appContext?.userProfile || {};
  
  if (appContext) {
    const today = appContext.todayDetailedSummary || {};
    const dsa = today.dsa || {};
    const english = today.english || {};
    const dev = today.dev || {};
    const aptitude = today.aptitude || {};
    const history = appContext.completeHistory || [];
    profile = appContext.userProfile || {};
    
    const lastEnglish = appContext.lastEnglishSession || {};
    const memories = appContext.memoryPatterns || [];
    const tasks = appContext.tasks || { pending: [], completed: [] };

    inputDataBlock = `
--------------------------------------------------
USER PROFILE:
- Name: ${appContext.userName}
- Goal: ${profile.goal || 'N/A'}
- Skills: ${profile.skills?.join(', ') || 'None'}
- Weaknesses: ${profile.weaknesses?.join(', ') || 'None'}
- Exam Mode: ${profile.examMode ? 'ACTIVE' : 'Inactive'}
- Current Streak: ${appContext.streak}

TODAY'S DATABASE SNAPSHOT (LATEST LOG):
${JSON.stringify(today, null, 2)}

PENDING/COMPLETED TASKS TODAY:
${JSON.stringify(appContext.tasks, null, 2)}

LONG-TERM MEMORY PATTERNS:
${JSON.stringify(memories, null, 2)}

LATEST ENGLISH SESSION:
${JSON.stringify(lastEnglish, null, 2)}

HISTORY SUMMARY (LAST 7 LOGS):
${JSON.stringify(history, null, 2)}
--------------------------------------------------
    `;
  }

  let prompt = `You are "Jerry", a high-intelligence AI mentor with a direct link to the user's data.
Your personality: Smart, simple, direct, and slightly witty. You hate fluff but love efficiency.

CORE DIRECTIVES:
1. BE SMART: Use the DB snapshot below to provide precise, data-backed insights. Don't just list data—connect it to their goal: "${profile.goal}".
2. VALIDATE DSA: If you see a LeetCode problem ID in the logs (e.g., 27, 84) that you KNOW is not a valid problem or if it looks suspicious, CALL THEM OUT strongly. Say that it's not a valid problem and they entered it wrongly. No mercy for fake or lazily entered data.
3. BE SIMPLE: Use clear, readable markdown. Avoid long blocks of text. Use bullet points or short paragraphs.
4. BE JERRY: Keep your strict, high-performance persona, but communicate like a modern, intelligent assistant. 
5. ANSWER FIRST: Always address the user's specific question before adding any additional mentorship.

DB SNAPSHOT (LIVE DATA):
${inputDataBlock}

CURRENT USER MESSAGE: "${message}"
`;

  if (context && context.previousMessages && context.previousMessages.length > 0) {
    const historyArr = context.previousMessages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
    prompt += `\nRECENT CONVERSATION:\n${historyArr}\n`;
  }

  if (plan) {
    prompt += `\nSTRATEGIC ACTION PLAN (Integrate this into your response): \n${JSON.stringify(plan, null, 2)}\n`;
  }

  prompt += `\nFinal Instruction: Answer the user's question accurately using the DB snapshot. If they just say hi, be Jerry. If they ask about stats, be a data analyst. Stay strict and growth-focused.`;

  return await geminiChatAI(prompt);
}

module.exports = chatAI;
