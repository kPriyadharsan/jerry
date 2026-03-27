const User = require('../../models/User');

/**
 * Updates the user's streak when they perform an action today.
 * @param {Object} user - The user document
 * @returns {Promise<Object>} - The updated user document
 */
exports.updateUserStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  // If already active today, no need to update
  if (lastActive && lastActive.getTime() === today.getTime()) {
    return user;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Migration fallback: If lastActiveDate is missing but streak exists, assume it was yesterday
  const effectiveLastActive = lastActive || (user.streak > 0 ? yesterday : null);
  
  if (!effectiveLastActive) {
    user.streak = 1;
  } else if (effectiveLastActive.getTime() === yesterday.getTime()) {
    // Continued streak from yesterday
    user.streak += 1;
  } else {
    // Streak broken or new streak
    user.streak = 1;
  }

  user.lastActiveDate = today;
  return await user.save();
};

/**
 * Calculates current streak for display, resetting it if missed.
 * This does not save to DB, just returns what the streak *should* be.
 * @param {Object} user 
 * @returns {Number} 
 */
exports.getCurrentStreak = (user) => {
  // Migration fallback: If lastActiveDate is missing but streak exists, 
  // we show the old streak for now until they perform an action or it naturally resets.
  if (!user.lastActiveDate) return user.streak || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = new Date(user.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If active today or yesterday, the streak is still valid
  if (lastActive.getTime() === today.getTime() || lastActive.getTime() === yesterday.getTime()) {
    return user.streak || 0;
  }

  // Otherwise, streak is broken
  return 0;
};

