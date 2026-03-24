const { analysisAI: geminiAnalysisAI } = require('../geminiService');

async function planningAI(analysisResult, intent, appContext) {
  const prompt = `
Based on the following performance analysis for the specific domain: ${intent}
-----------------------------------
PHASE 1: ANALYSIS SUMMARY
${JSON.stringify(analysisResult, null, 2)}

-----------------------------------
PHASE 2: FULL DATABASE SNAPSHOT (for cross-validation)
${JSON.stringify(appContext, null, 2)}

-----------------------------------
TASK: Generate a high-impact, specific next step for the user.
Output STRICTLY in this JSON format:
{
  "nextTask": "Actionable clear next step",
  "time": "e.g. '30 mins'",
  "priority": "low | medium | high",
  "reason": "Explain how this step addresses specific issues found in the DB snapshot"
}

Rules:
1. Ensure the nextTask aligns with their Goal: ${appContext?.userProfile?.goal || 'N/A'}.
2. If they are in a streak, keep the momentum.
3. Be EXTREMELY specific based on the DB logs.
4. DO NOT generate markdown backticks around the JSON.
   `;

  try {
    // using analysisAI to not consume high-priority chat queue
    const aiResponseText = await geminiAnalysisAI(prompt);
    
    // Clean up potential markdown formatting
    const cleanJson = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('[planningAI] failed:', error.message);
    return {
      nextTask: "Continue with daily goals",
      time: "15 mins",
      priority: "medium",
      reason: "Ensure regular practice"
    };
  }
}

module.exports = planningAI;
