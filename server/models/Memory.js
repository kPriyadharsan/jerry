const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['pattern', 'weakness', 'behavior'], required: true },
  value: { type: String, required: true },
  frequency: { type: Number, default: 1 }
}, { timestamps: true });

// Ensure uniqueness per user, type, and value
memorySchema.index({ userId: 1, type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Memory', memorySchema);
