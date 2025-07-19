const express = require('express');
const Assign = require('../models/assign.model'); 
const Lead = require('../models/lead.model');

const router = express.Router();

router.post('/assign', async (req, res) => {
  const { lead_id, telecaller_id, telecaller_name, status, remarks, history } = req.body;

  if (!lead_id || !telecaller_id || !telecaller_name) {
    return res.status(400).json({
      success: false,
      message: 'lead id, telecaller id, and telecaller name are required.',
    });
  }

  try {
    // 1️⃣ Get the lead doc first
    const lead = await Lead.findByIdAndUpdate(
      lead_id,
      { status: 'assigned' }, // also update its status
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    // 2️⃣ Create the assignment with embedded lead data
    const assign = new Assign({
      lead_id,
      telecaller_id,
      telecaller_name,
      status: status || 'assigned',
      remarks: remarks || '',
      history: history || [],
      lead_details: {   // ✅ this is the snapshot
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
    });

    await assign.save();

    return res.status(201).json({
      success: true,
      message: 'Assigned successfully & lead status updated',
      data: assign,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});

router.get('/all/assigns', async (req, res) => {
  try {
    const assigns = await Assign.find();
    return res.status(200).json({
      success: true,
      data: assigns,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});

module.exports = router;
