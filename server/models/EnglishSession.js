const mongoose = require('mongoose');

const englishSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  fluency: { type: Number, required: true },
  clarity: { type: Number, required: true },
  vocabulary: { type: Number, required: true },
  grammar: { type: Number, required: true },
  overall: { type: Number, required: true },
  feedback: { type: String },
  strength: { type: String },
  improve: { type: String },
  summary: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('EnglishSession', englishSessionSchema);
