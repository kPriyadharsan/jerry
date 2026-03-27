const { chatAI: geminiChatAI } = require('../providers/gemini');
const { chatPrompt } = require('../prompts');

async function chatAI({ message, plan, context, appContext, intent, analysis }) {
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
    const voiceMistakes = appContext.voiceMistakeHistory || [];

    // Build a readable voice mistake block for Jerry
    let voiceMistakeBlock = 'No voice practice mistakes recorded yet.';
    if (voiceMistakes.length > 0) {
      voiceMistakeBlock = voiceMistakes.map(log => {
        const date = new Date(log.createdAt).toLocaleDateString('en-IN', {
          weekday: 'long', month: 'short', day: 'numeric'
        });
        const mistakeLines = (log.mistakes || []).slice(0, 3).map(m =>
          `  ❌ "${m.wrongPhrase}" → ✅ "${m.correctPhrase}" [${m.grammarRule}]`
        ).join('\n');
        return `[${date}] Topic: ${log.topic}\n${mistakeLines || '  No specific mistakes logged'}`;
      }).join('\n\n');
    }

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

RECOMMENDED NEXT ENGLISH TOPIC (From System Engine):
${appContext.recommendedNextTopic ? JSON.stringify(appContext.recommendedNextTopic, null, 2) : 'No recommendation available yet.'}

HISTORY SUMMARY (LAST 7 LOGS):
${JSON.stringify(history, null, 2)}

VOICE PRACTICE — RECENT GRAMMAR MISTAKES (Reference these specifically!):
${voiceMistakeBlock}
--------------------------------------------------
    `;
  }

  // Populate template
  const analysisBlock = analysis 
    ? JSON.stringify({ identified: analysis.identifiedWeaknesses, cleared: analysis.overcomeWeaknesses }, null, 2) 
    : "No changes detected.";

  const planBlock = plan 
    ? `\nSTRATEGIC ACTION PLAN (Integrate this into your response): \n${JSON.stringify(plan, null, 2)}\n` 
    : "";

  let finalPrompt = chatPrompt
    .replace('{{goal}}', profile.goal || 'N/A')
    .replace('{{inputDataBlock}}', inputDataBlock)
    .replace('{{analysis}}', analysisBlock)
    .replace('{{plan}}', planBlock);

  if (context && context.previousMessages && context.previousMessages.length > 0) {
    const historyArr = context.previousMessages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
    finalPrompt += `\nRECENT CONVERSATION:\n${historyArr}\n`;
  }

  finalPrompt += `\nCURRENT USER MESSAGE: "${message}"`;
  finalPrompt += `\nFinal Instruction: Answer the user's question accurately. If the user is on a logic thread or asking continuous related questions, skip full summaries and just provide the simple response.`;

  return await geminiChatAI(finalPrompt);
}

module.exports = chatAI;
