const { analysisAI: geminiAnalysisAI } = require('../geminiService');

// Simple in-memory cache map 
const analysisCache = new Map();

async function analysisAI(appContext, intent) {
  // Cache check per user per day to avoid redundant calls
  const cacheKey = `${appContext?.userName || 'unknown'}-${intent}-${new Date().toDateString()}`;
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey);
  }

  const prompt = `
Analyze the user data and performance strictly based on the following specific logs and states for the category: ${intent}
${JSON.stringify(appContext, null, 2)}

Return STRICTLY in this JSON format:
{
  "issues": ["issue 1", "issue 2"],
  "trend": "improving | declining | mixed | stagnant",
  "focus": "primary area to focus on",
  "severity": "low | medium | high"
}

Rules:
- DO NOT generate explanations outside the JSON.
- DO NOT include markdown formatting or backticks around the JSON.
- Extract patterns, weaknesses, and the general trend based on their activity.
  `;

  try {
    const aiResponseText = await geminiAnalysisAI(prompt);
    
    // Clean up potential markdown formatting
    const cleanJson = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    // Save to cache
    analysisCache.set(cacheKey, result);

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
