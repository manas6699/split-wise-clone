// controllers/assign.controller.js

const Assign = require('../models/assign.model');
const Lead = require('../models/lead.model');
const User = require('../models/user.model');

// ✅ Import your firebase-admin config
const admin = require('../config/firebaseAdmin'); // Make sure you have initialized this properly

/**
 * 📌 Create an assignment + update lead status
 */
exports.createAssignment = async (req, res) => {
  const { lead_id, assignee_id, assignee_name, status, remarks, history } = req.body;

  if (!lead_id || !assignee_id || !assignee_name) {
    return res.status(400).json({
      success: false,
      message: 'lead_id, assignee_id, and assignee_name are required.',
    });
  }

  try {
    // ✅ Update lead status to "assigned"
    const lead = await Lead.findByIdAndUpdate(
      lead_id,
      { status: 'assigned' },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    // ✅ Create assignment record
    const assign = new Assign({
      lead_id,
      assignee_id,
      assignee_name,
      status: status || 'assigned',
      remarks: remarks || '',
      history: history || [],
      lead_details: {
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

    // ✅ Fetch the assignee to get their FCM token
    const assignee = await User.findById(assignee_id);
    if (!assignee || !assignee.fcmToken) {
      console.warn('No FCM token for assignee, skipping push.');
    } else {
      // ✅ Send push notification using Firebase Admin SDK
      const message = {
        token: assignee.fcmToken,
        notification: {
          title: 'New Lead Assigned',
          body: `A new lead has been assigned to you: ${lead.name || 'Lead'}`,
        },
        data: {
          leadId: lead._id.toString(),
        },
      };

      try {
        const response = await admin.messaging().send(message);
        console.log('✅ Push sent successfully:', response);
      } catch (pushErr) {
        console.error('❌ Error sending push notification:', pushErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Assigned successfully & lead status updated',
      data: assign,
    });
  } catch (error) {
    console.error('❌ Error creating assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * 📌 Get ALL assignments
 */
exports.getAllAssignments = async (_req, res) => {
  try {
    const assigns = await Assign.find();
    return res.status(200).json({
      success: true,
      count: assigns.length,
      data: assigns,
    });
  } catch (error) {
    console.error('❌ Error fetching assignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * 📌 Get assignments for specific assignee_id
 */
exports.getAssignmentsByAssignee = async (req, res) => {
  const { assignee_id } = req.params;

  if (!assignee_id) {
    return res.status(400).json({
      success: false,
      message: 'Assignee ID is required',
    });
  }

  try {
    const assigns = await Assign.find({ assignee_id });
    return res.status(200).json({
      success: true,
      count: assigns.length,
      data: assigns,
    });
  } catch (error) {
    console.error('❌ Error fetching assignments by assignee:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
