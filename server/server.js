// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Utility to load environment variables from .env file (for local development)
// On Render, environment variables are set directly in the service configuration.
require('dotenv').config({ path: './.env' }); 

const app = express();

// --- Configuration & Initialization ---

// 1. Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1); 
  }
};
connectDB();

// 2. Middleware
app.use(express.json()); // Body parser for JSON requests

// CORS Configuration (Crucial for Vercel/Render connection)
// Replace with your Vercel URL once deployed, and set it as an environment variable (e.g., process.env.FRONTEND_URL)
const allowedOrigins = [
  'http://localhost:3000', // React development server
  process.env.FRONTEND_URL, // Your Vercel frontend URL
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
        if (!origin) return callback(null, true); 
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy does not allow access from the specified Origin.';
            console.warn(msg + ' Attempted origin: ' + origin);
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 3. Import Routes
const activityRoutes = require('./routes/activityRoutes');

// 4. API Routes
app.use('/api/activities', activityRoutes);

// Simple health check endpoint for Render
app.get('/', (req, res) => res.send('EcoAction API is running on Render.'));


// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
