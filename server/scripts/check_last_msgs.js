const mongoose = require('mongoose');
require('dotenv').config();

const ChatHistory = require('./models/ChatHistory');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const history = await ChatHistory.findOne().sort({ updatedAt: -1 });
    if (history) {
      console.log('Recent messages:');
      history.messages.slice(-5).forEach(m => {
        console.log(`[${m.role}] ${m.content}`);
      });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
