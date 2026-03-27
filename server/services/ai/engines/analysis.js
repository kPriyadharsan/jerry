const { analysisAI: geminiAnalysisAI } = require('../providers/gemini');

async function analysisAI(appContext, intent) {

  const prompt = `
Analyze the user data and performance strictly based on the following specific logs and states for the category: ${intent}
${JSON.stringify(appContext, null, 2)}

Return STRICTLY in this JSON format:
{
  "issues": ["issue 1", "issue 2"],
  "trend": "improving | declining | mixed | stagnant",
  "focus": "primary area to focus on",
  "severity": "low | medium | high",
  "identifiedWeaknesses": ["topic A", "topic B"],
  "overcomeWeaknesses": ["topic C"]
}

Rules:
- DO NOT generate explanations outside the JSON.
- DO NOT include markdown formatting or backticks around the JSON.
- Extract patterns, weaknesses, and the general trend based on their activity.
- "identifiedWeaknesses": Add a topic if the user is consistently getting low marks (e.g. < 60%) or frequently skipping tasks in that category.
- "overcomeWeaknesses": Add a topic if it was previously a weakness but the user has shown significant improvement (e.g. marks > 80% or consistent completion).
- Compare performance to global standards for "DSA", "English", "Aptitude" if specific comparison data is unavailable.
- If a user skips a task, consider that a potential weakness if it happens multiple times.
  `;


  try {
    const aiResponseText = await geminiAnalysisAI(prompt);
    
    // Clean up potential markdown formatting
    const cleanJson = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);


    return result;
  } catch (error) {
    console.error('[analysisAI] failed:', error.message);
    return {
      issues: ["Insufficient data or parsing error"],
      trend: "mixed",
      focus: "consistency",
      severity: "low"
    };
  }
}

module.exports = analysisAI;
