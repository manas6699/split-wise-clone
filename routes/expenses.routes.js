const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');

const addExpenseHandler = require('../controllers/addExpense.controller')

const router = express.Router();


router.route("/expenses").post(authMiddleware , addExpenseHandler);


module.exports = router;