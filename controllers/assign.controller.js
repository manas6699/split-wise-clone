// controllers/assign.controller.js

const Assign = require('../models/assign.model');
const Lead = require('../models/lead.model');
const User = require('../models/user.model');


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

    const io = req.app.get('io');
    io.to(assignee_id).emit('lead-assigned', {
      title: 'New Lead Assigned',
      message: `A new lead has been assigned to you: ${lead.name || 'Lead'}`,
      leadId: lead._id.toString(),
    });

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
