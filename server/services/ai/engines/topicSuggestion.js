const { callWithOrchestration } = require('../providers/gemini');

// ─── Static Topic Library ────────────────────────────────────────────────────
// Mapping from weak areas → recommended topics
const WEAK_AREA_TOPIC_MAP = {
  tense:          { id: 'tense-mastery',        name: 'Tense Mastery: Perfect Forms',        category: 'Grammar' },
  fillers:        { id: 'fluent-no-fillers',     name: 'Fluent Speaking Without Fillers',     category: 'Fluency' },
  articles:       { id: 'articles-mastery',      name: 'Articles: A, An, The',                category: 'Grammar' },
  'subject-verb': { id: 'subject-verb',          name: 'Subject-Verb Agreement',              category: 'Grammar' },
  prepositions:   { id: 'prepositions',          name: 'Prepositions in Context',             category: 'Grammar' },
  vocabulary:     { id: 'vocab-variety',         name: 'Expanding Vocabulary Range',          category: 'Vocabulary' },
  pronunciation:  { id: 'pronunciation',         name: 'Clear Pronunciation Drills',          category: 'Fluency' },
};

// Completion-based progression topics
const PROGRESSION_TOPICS = [
  { id: 'introducing-yourself',    name: 'Introducing Yourself',              category: 'Basics',       level: 1 },
  { id: 'group-discussion',        name: 'Group Discussion Strategies',       category: 'Advanced',     level: 2 },
  { id: 'star-method',             name: 'STAR Method — Behavioural Interviews', category: 'Interview', level: 3 },
  { id: 'work-experience',         name: 'Describing Work Experience',        category: 'Interview',    level: 2 },
  { id: 'tense-mastery',           name: 'Tense Mastery: Perfect Forms',      category: 'Grammar',      level: 1 },
  { id: 'fluent-no-fillers',       name: 'Fluent Speaking Without Fillers',   category: 'Fluency',      level: 1 },
  { id: 'subject-verb',            name: 'Subject-Verb Agreement',            category: 'Grammar',      level: 1 },
  { id: 'articles-mastery',        name: 'Articles: A, An, The',              category: 'Grammar',      level: 1 },
  { id: 'salary-negotiation',      name: 'Salary Negotiation Tactics',        category: 'Interview',    level: 3 },
  { id: 'technical-vocabulary',    name: 'Technical Vocabulary for IT',       category: 'Vocabulary',   level: 2 },
];

/**
 * suggestNextTopics
 * Uses weak areas from current session + past topic history to pick top 2-3 next topics.
 *
 * @param {string[]} currentWeakAreas     - e.g. ['tense', 'fillers']
 * @param {Object[]} topicHistory         - array of UserTopicHistory docs
 * @param {string}   currentTopic         - topic just practiced
 * @returns {Object[]}                    - ordered array of topic suggestions
 */
async function suggestNextTopics(currentWeakAreas = [], topicHistory = [], currentTopic = '') {
  const suggestions = [];
  const seen = new Set();

  // 1. Priority: topics mapped to current session weak areas
  for (const area of currentWeakAreas) {
    const mapped = WEAK_AREA_TOPIC_MAP[area.toLowerCase()];
    if (mapped && !seen.has(mapped.id)) {
      // Don't recommend the exact topic they JUST did as priority 1 unless score was terrible. We leave re-practice purely to score logic.
      if (mapped.id !== currentTopic) {
        suggestions.push({ ...mapped, priority: 1, reason: `Targets: ${area} (Current struggle)` });
        seen.add(mapped.id);
      }
    }
  }

  // 2. Needs Work: Revisit topics with poor average scores (< 65)
  for (const hist of topicHistory) {
    if (hist.avgScore > 0 && hist.avgScore < 65 && !seen.has(hist.topicId)) {
      const topicObj = PROGRESSION_TOPICS.find(t => t.id === hist.topicId) 
        || Object.values(WEAK_AREA_TOPIC_MAP).find(t => t.id === hist.topicId);
      
      if (topicObj) {
        suggestions.push({ 
          ...topicObj, 
          priority: 2, 
          reason: `Review needed (Avg Score: ${Math.round(hist.avgScore)}/100)` 
        });
        seen.add(hist.topicId);
      }
      if (suggestions.length >= 3) break;
    }
  }

  // 3. Recurring weak areas from history
  if (suggestions.length < 3) {
    for (const hist of topicHistory) {
      for (const area of (hist.weakAreas || [])) {
        const mapped = WEAK_AREA_TOPIC_MAP[area.toLowerCase()];
        if (mapped && !seen.has(mapped.id) && mapped.id !== currentTopic) {
          suggestions.push({ ...mapped, priority: 3, reason: `Recurring issue: ${area}` });
          seen.add(mapped.id);
          break; // one per history entry
        }
      }
      if (suggestions.length >= 3) break;
    }
  }

  // 4. Fallback: Progression topics not yet done
  if (suggestions.length < 3) {
    const doneIds = new Set(topicHistory.map(h => h.topicId));
    doneIds.add(currentTopic);
    for (const topic of PROGRESSION_TOPICS) {
      if (!doneIds.has(topic.id) && !seen.has(topic.id)) {
        suggestions.push({ ...topic, priority: 4, reason: 'Recommended next step' });
        seen.add(topic.id);
        if (suggestions.length >= 3) break;
      }
    }
  }

  // Return top 3, sorted by priority
  return suggestions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

module.exports = { suggestNextTopics, PROGRESSION_TOPICS };
