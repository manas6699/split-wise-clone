const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const rateLimit = require('express-rate-limit');

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/leads', leadLimiter, leadController.createLead);
router.get('/getallleads', leadController.getAllLeads);
router.get('/getlead/:assigneeId', leadController.getLeadbyId);
router.get('/getleadDetails/:id', leadController.getLeadDetailsbyId);
router.put('/leads/:id', leadController.updateLeadDetails);


module.exports = router;
