const express = require('express');

const checkexGrHandler = require('../controllers/checkexGr.controller')


const router = express.Router();



// middleware to check if user is authenticated
router.route("/allExpenses/:group_id").get(checkexGrHandler);

module.exports = router;