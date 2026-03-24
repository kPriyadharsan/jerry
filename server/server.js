require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const chatRoutes = require('./routes/chatRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const examModeRoutes = require('./routes/examModeRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const englishRoutes = require('./routes/englishRoutes');

const rateLimit = require('express-rate-limit');

const { initCronJobs } = require('./services/cronService');

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:');
    console.error(`   Code: ${err.code} | Message: ${err.message}`);
    if (err.message && err.message.includes('Authentication failed')) {
      console.error('   → Check your Atlas username/password in .env');
    }
    if (err.message && err.message.includes('ECONNREFUSED')) {
      console.error('   → Make sure MongoDB is running locally or Atlas URI is correct');
    }
    process.exit(1);
  }
};
connectDB();

// Health Check
app.get('/', (req, res) => res.json({ status: 'Jerry Brain Server is alive', time: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/chat', chatRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exam-mode', examModeRoutes);

const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  message: {
    error: "Too many requests. Please slow down."
  }
});
app.use('/api/gemini', geminiLimiter, geminiRoutes);   // Gemini proxy — keys are server-side only
app.use('/api/english', englishRoutes);

// Initialize Cron Jobs
initCronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
