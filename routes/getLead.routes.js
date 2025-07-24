const express = require('express');
const router = express.Router();

const Leads = require('../models/lead.model');

const Campaign = require('../models/campaign.model');

const RoundRobinState = require('../models/roundrobin.model');

const checkPhoneNumber = require('../utils/checkPhoneNumber');

const Assign = require('../models/assign.model');

const User = require('../models/user.model');

const rateLimit = require('express-rate-limit');

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/leads', leadLimiter, async (req, res) => {
  const { name, email, phone, source } = req.body;

  if (!name || !email || !phone || !source) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!checkPhoneNumber.isValidRealisticPhoneNumber(phone)) {
    return res.status(400).json({ message: 'Please use a valid phone number' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    // ✅ Create the lead with default status
    const newLead = new Leads({
      name,
      email,
      phone,
      source,
      status: 'not-assigned' // default fallback
    });

    // ✅ Try to find a matching campaign for the source
    const campaign = await Campaign.findOne({ source, auto_assign: true });

    if (campaign && campaign.telecallers.length > 0) {
      const telecallers = campaign.telecallers;

      // Find round-robin state for this campaign
      let state = await RoundRobinState.findOne({ campaignId: campaign._id });
      let index = 0;

      if (!state) {
        // First time — start at 0
        state = new RoundRobinState({
          campaignId: campaign._id,
          lastAssignedIndex: 0
        });
      } else {
        index = (state.lastAssignedIndex + 1) % telecallers.length;
        state.lastAssignedIndex = index;
      }

      await state.save();

     const assignedTelecallerId = telecallers[index];
      newLead.assigned_to = assignedTelecallerId;

      const telecaller = await User.findById(assignedTelecallerId, 'name');
      newLead.assignee_name = telecaller ? telecaller.name : '';

      newLead.status = 'auto-assigned';

       // ✅ ✅ ✅ Create Assign record too
      await Assign.create({
        lead_id: newLead._id.toString(),
        assignee_id: assignedTelecallerId,
        assignee_name: telecaller ? telecaller.name : '',
        status: 'auto-assigned',
        remarks: 'auto-assigned', 
        history: [], 
        lead_details: {
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          source: newLead.source,
          status: newLead.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    await newLead.save();

    res.status(201).json({
      message: 'Lead created successfully',
      lead: newLead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/getallleads', async (req, res) => {
  try {
    const leads = await Leads.find();
    res.status(200).json({ message: 'Leads fetched successfully', leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
