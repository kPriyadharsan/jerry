const mongoose = require('mongoose');
require('dotenv').config();

const ChatHistory = require('./models/ChatHistory');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const history = await ChatHistory.find({});
    console.log('Chat History found:', JSON.stringify(history, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
