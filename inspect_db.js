const mongoose = require('./server/node_modules/mongoose');
const dotenv = require('./server/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const User = require('./server/models/User');

async function checkUsers() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in env');
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ID: ${u._id}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Streak: ${u.streak}`);
      console.log(`  LastActiveDate: ${u.lastActiveDate}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
