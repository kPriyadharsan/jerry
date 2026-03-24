exports.calculateScore = (data) => {
  let finalScore = 0;

  const targets = {
    dsa: Number(process.env.TARGET_DSA_PROBLEMS) || 2,
    english: Number(process.env.TARGET_ENGLISH_MINS) || 30,
    apps_hours: 2, // Default target for hours
    apps_questions: 10 // Default target for questions
  };

  // 1. DSA (30 points) - Factor in difficulty
  if (data.dsa && data.dsa.problems > 0) {
    const multipliers = { 'Easy': 0.7, 'Medium': 1.0, 'Hard': 1.5 };
    const multiplier = multipliers[data.dsa.difficulty] || 1.0;
    
    let effectiveProblems = data.dsa.problems * multiplier;
    let dsaScore = (effectiveProblems / targets.dsa) * 30;
    
    finalScore += Math.min(dsaScore, 30);
  }

  // 2. Aptitude (30 points)
  if (data.apps) {
    let appScore = 0;
    // Concept/Study (15 points)
    if (data.apps.hours > 0) {
      appScore += Math.min((data.apps.hours / targets.apps_hours) * 15, 15);
    } else if (data.apps.topic) {
      appScore += 10; // Partial points just for starting a topic
    }
    
    // Practice/Performance (15 points)
    if (data.apps.questions > 0) {
      let performance = (data.apps.questions / targets.apps_questions) * 7.5 + ((data.apps.score || 0) / 100) * 7.5;
      appScore += Math.min(performance, 15);
    }
    finalScore += appScore;
  }

  // 3. English (40 points)
  if (data.english && (data.english.minutes > 0 || data.english.avgOverallScore > 0)) {
    // 20 points for effort (minutes) + 20 points for quality (AI average score)
    let effort = (data.english.minutes / targets.english) * 20;
    let quality = ((data.english.avgOverallScore || 0) / 100) * 20;
    
    let engScore = effort + quality;
    finalScore += Math.min(engScore, 40);
  }

  // 4. Dev (0 points) - Optional category per user request
  // No score added.

  return Math.round(finalScore);
};
