const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
  wrongPhrase:   { type: String, required: true },
  correctPhrase: { type: String, required: true },
  grammarRule:   { type: String, required: true },
  severity:      { type: String, enum: ['minor', 'moderate', 'critical'], default: 'minor' },
  timestamp:     { type: String }, // timestamp in audio, e.g. "00:34"
});

const voiceMistakeLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishSession' },
  topic:     { type: String, default: 'General Practice' },
  mistakes:  [mistakeSchema],
  score:     { type: Number, default: 0 },
  duration:  { type: Number, default: 0 }, // seconds
}, { timestamps: true });

module.exports = mongoose.model('VoiceMistakeLog', voiceMistakeLogSchema);
