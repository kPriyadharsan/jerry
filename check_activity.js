const mongoose = require('./server/node_modules/mongoose');
const dotenv = require('./server/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const User = require('./server/models/User');
const DailyLog = require('./server/models/DailyLog');

async function checkActivity() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const user = await User.findOne({ name: 'SaiPallavi' });
    if (!user) throw new Error('User not found');
    
    console.log(`Checking logs for ${user.name} (${user._id}):`);
    const logs = await DailyLog.find({ userId: user._id }).sort({ date: -1 }).limit(5);
    
    logs.forEach(l => {
      console.log(`- Date: ${l.date.toISOString()}, Score: ${l.score}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkActivity();
