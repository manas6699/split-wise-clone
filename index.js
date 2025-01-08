const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth')

const connectDB = require('./db/dbconnection')

const protectedRoute = require('./routes/protectedRoute')
require('dotenv').config();


const app = express();

app.use(bodyParser.json());

// db connection
connectDB()

// Routes
app.use('/api/auth', authRoutes);
app.use('/api',protectedRoute);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
