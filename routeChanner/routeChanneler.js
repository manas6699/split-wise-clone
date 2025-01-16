
const express = require('express');
const router = express.Router();

const authRoutes = require('../routes/auth');

const protectedRoute = require('../routes/protectedRoute');
const addExpenseHandler = require('../routes/expenses.routes');
const allUserList = require('../routes/userlist.routes');
const groupRoutes = require('../routes/group.routes');
const checkexgr = require('../routes/checkexGr.routes');

router.use('/auth', authRoutes);

router.use('/protected', protectedRoute);

router.use('/expense', addExpenseHandler);

router.use('/show', allUserList);

router.use('/group', groupRoutes);

router.use('/check', checkexgr);

module.exports = router;

