const express = require('express');

const addExpenseHandler = require('../controllers/addExpense.controller')

const expenseDetailsHandler = require('../controllers/expenseDetails.controller')

const authMiddleware = require('../middlewares/auth.middleware');

const editExpenseHandle = require('../controllers/expenseEdit.controller');

const router = express.Router();


router.route("/add/:group_id").post(addExpenseHandler);

router.route("/details/:expense_id").get(authMiddleware , expenseDetailsHandler);

router.route("/edit/:expense_id").put(authMiddleware , editExpenseHandle);


module.exports = router;