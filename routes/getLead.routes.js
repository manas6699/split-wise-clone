const express = require('express');
const router = express.Router();

const Leads = require('../models/lead.model');

const checkPhoneNumber = require('../utils/checkPhoneNumber');


const rateLimit = require('express-rate-limit');
// const authMiddleware = require('../middlewares/auth.middleware');

// Limit to 5 requests per IP every 15 minutes
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
});


router.post('/leads', leadLimiter, async(req,res) => {
    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.source) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (!checkPhoneNumber.isValidRealisticPhoneNumber(req.body.phone)) {
        return res.status(400).json({ message: 'Please use a vaild phone number' });
    }
    if (!req.body.email.includes('@')) {
        return res.status(400).json({ message: '@ is missing' });
    }
    
    try {
        const { name, email, phone , source } = req.body;
        const newLead = new Leads({ name, email, phone, source });
        await newLead.save();
        res.status(201).json({ message: 'Lead created successfully', lead: newLead });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})

router.get('/getallleads', authMiddleware, async(req,res) => {
    try {
        const leads = await Leads.find();
        res.status(200).json({ message: 'Leads fetched successfully', leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
)

module.exports = router;