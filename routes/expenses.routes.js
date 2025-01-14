const express = require('express');

const addExpenseHandler = require('../controllers/addExpense.controller')

const router = express.Router();


router.route("/expenses").post(addExpenseHandler);


module.exports = router;