const DailyLog = require('../../models/DailyLog');

exports.getTaskStatus = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await DailyLog.findOne({ userId, date: { $gte: today } });

  const targets = {
    dsa: Number(process.env.TARGET_DSA_PROBLEMS) || 2, // problems
    english: Number(process.env.TARGET_ENGLISH_MINS) || 30, // minutes
    dev: Number(process.env.TARGET_DEV_MINS) || 60, // minutes
    apps: Number(process.env.TARGET_APPS_TOPICS) || 1 // topics/concepts
  };

  const pending = [];
  const completed = [];
  const optional = [];

  // 1. DSA (30 Marks)
  if (log && log.dsa && log.dsa.problems >= targets.dsa) {
    completed.push({ type: 'DSA', title: `Mastery achieved: ${log.dsa.problems} problems`, value: log.dsa.problems });
  } else {
    const done = log?.dsa?.problems || 0;
    pending.push({ type: 'DSA', title: `Goal: ${targets.dsa} problems (Current: ${done})`, remaining: targets.dsa - done });
  }

  // 2. Aptitude (30 Marks)
  if (log && log.apps && (log.apps.hours >= 1 || log.apps.questions >= 5)) {
    completed.push({ type: 'Apps/Concepts', title: `Studied: ${log.apps.topic || 'General'} (${log.apps.questions} qs)`, value: log.apps.topic });
  } else {
    pending.push({ type: 'Apps/Concepts', title: 'Study 1 Concept & Practice', remaining: 1 });
  }

  // 3. English (40 Marks)
  if (log && log.english && log.english.minutes >= targets.english) {
    completed.push({ type: 'English', title: `Fluency drill: ${log.english.minutes} mins`, value: log.english.minutes });
  } else {
    const done = log?.english?.minutes || 0;
    pending.push({ type: 'English', title: `Target: ${targets.english} mins (Done: ${done})`, remaining: targets.english - done });
  }

  // 4. Development (Optional - 0 Marks)
  if (log && log.dev && log.dev.minutes > 0) {
    completed.push({ type: 'Development', title: `Built: ${log.dev.project} (${log.dev.minutes}m)`, value: log.dev.minutes });
  } else {
    optional.push({ type: 'Development', title: 'Work on Project (Optional)', value: 0 });
  }

  return { pending, completed, optional, log };
};
