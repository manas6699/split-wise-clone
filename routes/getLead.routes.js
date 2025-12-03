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

// removed rate-limiting middleware from here
router.post('/leads', leadController.createLead);
router.post('/leads/manual', leadController.createLead2);
router.get('/getallleads', leadController.getAllLeads);
router.get('/getlead/:assigneeId', leadController.getLeadbyId);
// this handles fix card data
router.get('/getleadDetails/:id', leadController.getLeadDetailsbyId);
router.put('/leads/:id', leadController.updateLeadDetails);
router.put('/leads/updateBasic/:id', leadController.updateLeadBasicInfo);

// route to get multiple leads
router.post('/get/multipleLeadDetails' , leadController.getBulkLeads);


module.exports = router;
