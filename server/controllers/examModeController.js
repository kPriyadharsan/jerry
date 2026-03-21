const User = require('../models/User');

exports.toggleExamMode = async (req, res) => {
  try {
    const { examMode } = req.body;
    const userId = req.user.id;

    if (examMode === undefined) {
      return res.status(400).json({ error: 'examMode is required' });
    }

    const user = req.user;


    user.examMode = examMode;
    await user.save();

    res.json({ success: true, examMode: user.examMode });

  } catch (error) {
    console.error('Exam mode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
