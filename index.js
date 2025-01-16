const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this line
const authRoutes = require('./routes/auth');
const connectDB = require('./db/dbconnection');
const protectedRoute = require('./routes/protectedRoute');
const addExpenseHandler = require('./routes/expenses.routes');
const allUserList = require('./routes/userlist.routes');
const checkexgr = require('./routes/checkexGr.routes');
const createGroup = require('./routes/group.routes');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// db connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoute);
app.use('/api/expense', addExpenseHandler);
app.use('/api', allUserList);
app.use('/api', createGroup);
app.use('/api', checkexgr);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
