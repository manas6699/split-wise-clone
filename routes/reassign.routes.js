const express = require('express');
const Assign = require('../models/assign.model');
const Lead = require('../models/lead.model');
const {
  getReassignedByUserWithDetails,
} = require("../controllers/reassignHistory.controller");

const router = express.Router();

router.post('/reassign', async (req, res) => {
  const { lead_id, assignee_id, assignee_name, remarks, history_entry } = req.body;

  if (!lead_id || !assignee_id || !assignee_name) {
    return res.status(400).json({
      success: false,
      message: 'lead_id, assignee_id, and assignee_name are required.',
    });
  }

  try {
    // ✅ Update Assign document by lead_id
    const updatedAssign = await Assign.findOneAndUpdate(
      { lead_id }, // find the assign linked to this lead
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
        message: 'Assign document not found for this lead.',
      });
    }

    // ✅ Update Lead document status
    await Lead.findByIdAndUpdate(
      lead_id,
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

router.get("/all-sandwiched-history", getReassignedByUserWithDetails);

module.exports = router;
