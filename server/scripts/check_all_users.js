const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Users found:', users.map(u => ({ id: u._id, name: u.name, goal: u.goal })));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
