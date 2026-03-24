const cron = require('node-cron');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const Memory = require('../models/Memory');

exports.initCronJobs = () => {
  // Run at 11:50 PM daily
  cron.schedule('50 23 * * *', async () => {
    console.log('Running nightly summary job at 11:50 PM...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const users = await User.find({});

      for (const user of users) {
        // Fetch today's log
        const log = await DailyLog.findOne({ userId: user._id, date: { $gte: today } });

        if (!log || log.score === 0) {
          // Add weakness or pattern if day was missed
          await Memory.findOneAndUpdate(
            { userId: user._id, type: 'pattern', value: 'Missed daily objective' },
            { $inc: { frequency: 1 } },
            { upsert: true, new: true }
          );
        }
        
        // No manual streak handling here anymore - streakService handles it reactively
        await user.save();


        // Optional: Save a separate Summary or use DailyLog notes
        // Assuming summarize action can be saved as a system memory for today
        if (log) {
            await Memory.findOneAndUpdate(
              { userId: user._id, type: 'behavior', value: `Score on ${today.toDateString()}: ${log.score}` },
              { $inc: { frequency: 1 } },
              { upsert: true, new: true }
            );
        }
      }

      console.log('Nightly summary job completed successfully.');
    } catch (error) {
      console.error('Nightly cron job error:', error);
    }
  });
};
