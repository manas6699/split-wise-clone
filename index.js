const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const connectDB = require('./db/dbconnection')

const protectedRoute = require('./routes/protectedRoute')

const addExpenseHandler = require('./routes/expenses.routes')

const allUserList = require('./routes/userlist.routes')


const createGroup = require('./routes/group.routes')

require('dotenv').config();


const app = express();

app.use(bodyParser.json());

// db connection
connectDB()

// Routes
app.use('/api/auth', authRoutes);
app.use('/api',protectedRoute);
app.use('/api/add' ,addExpenseHandler );
app.use('/api',allUserList);
app.use('/api',createGroup);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
