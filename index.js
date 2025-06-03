const cors = require('cors');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbconnection');
const routeChanneler = require('./routeChanner/routeChanneler');
require('dotenv').config();

const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.mmrrealty.co.in',
];

// ✅ Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Important for sending cookies cross-origin
}));

// ✅ Middleware
app.use(cookieParser());
app.use(bodyParser.json());

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Connect to MongoDB
connectDB();

// ✅ API Routes
app.use('/api', routeChanneler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
