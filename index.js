const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const connectDB = require('./db/dbconnection');


const routeChanneler = require('./routeChanner/routeChanneler');

require('dotenv').config();

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://www.mmrrealty.co.in',
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  
  
app.use(bodyParser.json());

// db connection
connectDB();

app.use('/api' , routeChanneler)

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
