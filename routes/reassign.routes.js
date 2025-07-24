const express = require('express');
const Assign = require('../models/assign.model');
const Lead = require('../models/lead.model');

const router = express.Router();

router.post('/reassign', async (req, res) => {
  const {lead_id , assign_id, assignee_id, assignee_name, remarks, history_entry } = req.body;

  if (!lead_id || !assign_id || !assignee_id || !assignee_name) {
    return res.status(400).json({
      success: false,
      message: 'lead_id, assign_id, assignee_id, and assignee_name are required.',
    });
  }

  try {
    // get the lead and update it's status to 'reassigned'
    const lead = await Lead.findByIdAndUpdate(
        lead_id,
        { status: 'reassigned' }, 
        { new: true }
    )

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }
    // ✅ Update the Assign document
    const updatedAssign = await Assign.findByIdAndUpdate(
      assign_id,
      {
        $set: {
          assignee_id,
          assignee_name,
          status: 'reassigned',
          remarks,
        },
        $push: {
          history: history_entry,
        },
      },
      { new: true }
    );

    if (!updatedAssign) {
      return res.status(404).json({
        success: false,
        message: 'Assign document not found.',
      });
    }

    // ✅ Update the related Lead document too
    await Lead.findByIdAndUpdate(
      updatedAssign.lead_id,
      { status: 'reassigned' },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Lead reassigned successfully.',
      data: updatedAssign,
    });
  } catch (error) {
    console.error('Error reassigning lead:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

module.exports = router;
