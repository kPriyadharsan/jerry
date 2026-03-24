const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    users.forEach(u => {
      console.log(`ID: ${u._id}, LEN: ${u._id.toString().length}, NAME: ${u.name}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
