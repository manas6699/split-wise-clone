const express = require('express');

require('dotenv').config();

const router = express.Router();

const loginUser = require('../controllers/login.controller')
const logoutHandler = require('../controllers/logout.controller');
const registerUser = require('../controllers/register.controller');


// Register User
router.route("/register").post(registerUser)

// login
router.route("/login").post(loginUser)

// logout
router.route("/logout").post(logoutHandler)

module.exports = router;
