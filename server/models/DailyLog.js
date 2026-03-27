const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  dsa: {
    platform: { type: String, default: 'Unknown' },
    topics: { type: [String], default: [] },
    problems: { type: Number, default: 0 },
    problemIdentifiers: { type: [String], default: [] },
    difficulty: { type: String }, // e.g., 'Easy', 'Medium', 'Hard'
    timeTaken: { type: Number, default: 0 }, // in minutes
    solvedWithoutHelp: { type: Boolean, default: false }
  },
  apps: {
    topic: { type: String },
    hours: { type: Number, default: 0 },
    questions: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  },
  english: {
    topic: { type: String },
    minutes: { type: Number, default: 0 },
    avgOverallScore: { type: Number, default: 0 },
    sessionsCount: { type: Number, default: 0 },
    sessionSummaries: { type: [String], default: [] }
  },
  dev: {
    project: { type: String },
    minutes: { type: Number, default: 0 }
  },
  score: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

// Ensure one log per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
