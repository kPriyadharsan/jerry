const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, 'name goal skills weaknesses');
    console.log('Users found:', JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
