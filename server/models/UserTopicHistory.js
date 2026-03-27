const mongoose = require('mongoose');

const userTopicHistorySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId:      { type: String, required: true },   // e.g. 'introducing-yourself'
  topicName:    { type: String, required: true },
  category:     { type: String, default: 'General' },
  sessionsCount:{ type: Number, default: 1 },
  lastPracticed:{ type: Date, default: Date.now },
  avgScore:     { type: Number, default: 0 },
  weakAreas:    { type: [String], default: [] },    // e.g. ['tense', 'fillers']
  completed:    { type: Boolean, default: false },
}, { timestamps: true });

// Compound index to ensure one record per user+topic
userTopicHistorySchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('UserTopicHistory', userTopicHistorySchema);
