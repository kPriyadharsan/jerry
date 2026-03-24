const mongoose = require('mongoose');
require('dotenv').config();

const Memory = require('./models/Memory');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const memories = await Memory.find({});
    console.log('Memories found:', JSON.stringify(memories, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
