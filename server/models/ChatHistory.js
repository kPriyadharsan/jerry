const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Limit messages array to the last 20
chatHistorySchema.pre('save', function () {
  if (this.messages.length > 20) {
    this.messages = this.messages.slice(-20);
  }
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
