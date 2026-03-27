const mongoose = require('mongoose');
require('dotenv').config();

const ChatHistory = require('./models/ChatHistory');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const history = await ChatHistory.find({});
    history.forEach(h => {
      h.messages.forEach(m => {
        if (m.content.toLowerCase().includes('nothing known') || m.content.toLowerCase().includes('i don\'t know about you')) {
          console.log(`User: ${h.userId}`);
          console.log(`Message: ${m.content}`);
        }
      });
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
