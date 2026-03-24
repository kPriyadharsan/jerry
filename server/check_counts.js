const mongoose = require('mongoose');
require('dotenv').config();

const DailyLog = require('./models/DailyLog');
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    for (const u of users) {
      const logs = await DailyLog.countDocuments({ userId: u._id });
      console.log(`User: ${u.name} (id: ${u._id}) has ${logs} logs.`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
