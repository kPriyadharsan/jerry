const { callWithOrchestration } = require('../providers/gemini');

const GRAMMAR_SYSTEM_PROMPT = `You are an English grammar coach for placement-preparing students in India.

Analyze the transcription provided and return ONLY valid JSON — no markdown, no extra text.

Return this exact structure:
{
  "transcription": "<the full spoken text you heard>",
  "mistakes": [
    {
      "wrongPhrase":   "<exact wrong phrase spoken>",
      "correctPhrase": "<corrected version>",
      "grammarRule":   "<rule violated, e.g. Subject-Verb Agreement>",
      "severity":      "minor|moderate|critical",
      "timestamp":     "<approximate position in speech, e.g. '00:34'>"
    }
  ],
  "weakAreas": ["<area1>","<area2>"],
  "overallGrammarScore": <0-100>
}

Focus on: tense errors, subject-verb agreement, articles, prepositions, filler words (um, uh, like, basically), repetition.
If no mistakes found, return an empty mistakes array.
WeakAreas should be short tags like: "tense", "fillers", "articles", "subject-verb", "prepositions".`;

/**
 * analyzeGrammar
 * @param {Array} audioParts  - Gemini inline audio parts
 * @param {Object} context    - { userName, topic, duration }
 * @returns {Object}          - parsed grammar result JSON
 */
async function analyzeGrammar(audioParts, context = {}) {
  const contextBlock = `
Topic being practiced: ${context.topic || 'General English Speaking'}
Speaker name: ${context.userName || 'Student'}
Recording duration: ~${context.duration || 0} seconds
`;

  const parts = [
    { text: GRAMMAR_SYSTEM_PROMPT + '\n\n' + contextBlock },
    ...audioParts.filter(p => !p.text),
  ];

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

  try {
    const raw = await callWithOrchestration(parts, 'normal', 5, models);
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      transcription:        parsed.transcription        || '',
      mistakes:             Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      weakAreas:            Array.isArray(parsed.weakAreas) ? parsed.weakAreas : [],
      overallGrammarScore:  Number(parsed.overallGrammarScore) || 0,
    };
  } catch (err) {
    console.error('[GrammarAI] Analysis failed:', err.message);
    return {
      transcription:       '',
      mistakes:            [],
      weakAreas:           [],
      overallGrammarScore: 0,
    };
  }
}

module.exports = { analyzeGrammar };
