const express = require('express');
const router = express.Router();

const Leads = require('../models/getleads.model');

router.post('/leads', async(req,res) => {
    try {
        const { name, email, phone } = req.body;
        const newLead = new Leads({ name, email, phone });
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