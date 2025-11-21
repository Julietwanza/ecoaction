// server/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const { getActivities, addActivity } = require('../controllers/activityController');

// Middleware for auth would go here (e.g., authProtect)

// GET /api/activities - Get all activities for the user
router.get('/', getActivities);

// POST /api/activities - Add a new activity
router.post('/', addActivity);

module.exports = router;
