const express = require('express');
const router = express.Router();

const Leads = require('../models/getleads.model');

const checkPhoneNumber = require('../utils/checkPhoneNumber');

router.post('/leads', async(req,res) => {
    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.source) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (!checkPhoneNumber.isValidRealisticPhoneNumber(req.body.phone)) {
        return res.status(400).json({ message: 'You are kidding me! stop teasing me and give me your real phone number,You dummy!' });
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

router.get('/getallleads', async(req,res) => {
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