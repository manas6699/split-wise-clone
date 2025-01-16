const express = require('express');

const checkexGrHandler = require('../controllers/checkexGr.controller')

const authMiddleware = require('../middlewares/auth.middleware')
const router = express.Router();



// All expenses of a group
router.route("/allExpenses/:group_id").get(authMiddleware , checkexGrHandler);

module.exports = router;