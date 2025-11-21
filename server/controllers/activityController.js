// server/controllers/activityController.js
const Activity = require('../models/Activity');

// This function should eventually be moved to a separate service file
// For simplicity, it remains here and assumes the FE provides the calculated footprint.
// In a production app, the server would re-calculate and validate the footprint.
/*
const calculateFootprint = (activity) => {
  // Complex logic based on type, mode, and distance
  // ...
  return calculatedValue; 
}
*/

// @desc    Get all activities for a user
// @route   GET /api/activities
const getActivities = async (req, res) => {
  // In a real app, the userId would come from JWT/session: const userId = req.user.id;
  const userId = 'eco_user_123'; 
  try {
    const activities = await Activity.find({ userId }).sort({ date: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

// @desc    Add a new activity
// @route   POST /api/activities
const addActivity = async (req, res) => {
  // In a real app, the userId would come from JWT/session: const userId = req.user.id;
  const userId = 'eco_user_123';
  const { type, details, carbonFootprint, date } = req.body;

  try {
    // 1. (Optional but recommended) Recalculate and validate the footprint on the server
    // const finalFootprint = calculateFootprint(req.body); 

    const newActivity = new Activity({
      userId,
      type,
      details,
      carbonFootprint, // Assuming FE provided a reasonable calculation for now
      date,
    });

    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);

  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error logging activity', error: error.message });
  }
};

module.exports = {
  getActivities,
  addActivity,
};
