const express = require('express');

const addExpenseHandler = require('../controllers/addExpense.controller')

const expenseDetailsHandler = require('../controllers/expenseDetails.controller')

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();


router.route("/add").post(addExpenseHandler);

router.route("/details/:expense_id" , authMiddleware).get(expenseDetailsHandler);


module.exports = router;