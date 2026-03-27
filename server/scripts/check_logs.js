const mongoose = require('mongoose');
require('dotenv').config();

const DailyLog = require('./models/DailyLog');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const logs = await DailyLog.find({}).sort({ date: -1 }).limit(5);
    console.log('Daily Logs found:', JSON.stringify(logs, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
