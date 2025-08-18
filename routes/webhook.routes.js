// routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// GET for verification
router.get('/', webhookController.verifyWebhook);

// POST for receiving leads
router.post('/', webhookController.handleWebhook);

module.exports = router;
