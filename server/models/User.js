const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  goal: { type: String, required: true },
  skills: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  examMode: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

