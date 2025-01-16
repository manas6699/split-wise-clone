const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const connectDB = require('./db/dbconnection');


const routeChanneler = require('./routeChanner/routeChanneler');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// db connection
connectDB();

app.use('/api' , routeChanneler)

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
