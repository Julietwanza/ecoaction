// server/models/Activity.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: String, // Simple identifier for multi-user context
    required: true,
    default: 'eco_user_123', // Placeholder until auth is implemented
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: ['Travel', 'Energy', 'Food'],
  },
  details: {
    mode: { type: String, required: true },
    distance: { type: Number, required: true, min: 0.1 },
    unit: { type: String, required: true },
  },
  carbonFootprint: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Activity', ActivitySchema);
