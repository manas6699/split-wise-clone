const Leads = require('../models/lead.model');
const Campaign = require('../models/campaign.model');
const RoundRobinState = require('../models/roundrobin.model');
const Assign = require('../models/assign.model');
const User = require('../models/user.model');
const checkPhoneNumber = require('../utils/checkPhoneNumber');

exports.createLead = async (req, res) => {
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
    const newLead = new Leads({
      name,
      email,
      phone,
      source,
      status: 'not-assigned',
    });

    const campaign = await Campaign.findOne({ source, auto_assign: true });

    if (campaign && campaign.telecallers.length > 0) {
      const telecallers = campaign.telecallers;

      let state = await RoundRobinState.findOne({ campaignId: campaign._id });
      let index = 0;

      if (!state) {
        state = new RoundRobinState({
          campaignId: campaign._id,
          lastAssignedIndex: 0,
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
      lead: newLead,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Leads.find();
    res.status(200).json({ message: 'Leads fetched successfully', leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeadbyId = async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await Leads.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead fetched successfully', lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeadDetails = async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    'alternate_phone',
    'client_budget',
    'interested_project',
    'location',
    'preferred_floor',
    'preferred_configuration',
    'furnished_status',
    'property_status',
    'lead_status',
    'comments',
  ];

  try {
    // 1️⃣ Build updates
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // 2️⃣ Update Lead
    const updatedLead = await Leads.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // 3️⃣ Update Assign(s) linked to this Lead
    await Assign.updateMany(
      { lead_id: id }, // your Assign schema stores `lead_id` as String
      {
        $set: {
          'lead_details.alternate_phone': updatedLead.alternate_phone || '',
          'lead_details.client_budget': updatedLead.client_budget || '',
          'lead_details.interested_project': updatedLead.interested_project || '',
          'lead_details.location': updatedLead.location || '',
          'lead_details.preferred_floor': updatedLead.preferred_floor || '',
          'lead_details.preferred_configuration': updatedLead.preferred_configuration || '',
          'lead_details.furnished_status': updatedLead.furnished_status || '',
          'lead_details.property_status': updatedLead.property_status || '',
          'lead_details.lead_status': updatedLead.lead_status || '',
          'lead_details.comments': updatedLead.comments || '',
          'lead_details.updatedAt': new Date(),
        },
      }
    );

    res.status(200).json({
      message: 'Lead and Assign updated successfully',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

