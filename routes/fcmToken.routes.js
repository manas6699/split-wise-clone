// routes/userRoutes.ts

const express = require('express');
const { saveFcmToken } = require('../controllers/fcmToken.controller');

const router = express.Router();

router.post('/save-token', saveFcmToken);

module.exports = router;
