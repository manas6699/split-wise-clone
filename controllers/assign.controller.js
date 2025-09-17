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
        lead_type: lead.lead_type,
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

exports.bulkAssign = async (req, res) => {
  const { lead_ids, assignee_id, assignee_name, status, remarks, history } = req.body;

  if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'lead_ids (array) is required.',
    });
  }

  if (!assignee_id || !assignee_name) {
    return res.status(400).json({
      success: false,
      message: 'assignee_id and assignee_name are required.',
    });
  }

  try {
    // ✅ Fetch all leads
    const leads = await Lead.find({ _id: { $in: lead_ids } });

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid leads found.',
      });
    }

    // ✅ Update all leads to assigned
    await Lead.updateMany(
      { _id: { $in: lead_ids } },
      { $set: { status: 'assigned' } }
    );

    // ✅ Create assignment records
    const assignments = leads.map((lead) => ({
      lead_id: lead._id,
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
        status: 'assigned',
        lead_type: lead.lead_type,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
    }));

    await Assign.insertMany(assignments);

    // ✅ Send socket notification to telecaller
    const io = req.app.get('io');
    io.to(assignee_id).emit('bulk-lead-assigned', {
      title: 'Bulk Leads Assigned',
      message: `${leads.length} leads have been assigned to you.`,
      leadIds: leads.map((l) => l._id.toString()),
    });

    return res.status(201).json({
      success: true,
      message: `${leads.length} leads assigned successfully & statuses updated.`,
      data: assignments,
    });

  } catch (error) {
    console.error('❌ Error in bulk assignment:', error);
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
exports.getAllAssignments = async (req, res) => { 
  try {
    const queryObj = {};
    const { startDate, endDate, status, ...filters } = req.query;

    // ✅ Date range filter (based on createdAt of assignment)
    if (startDate || endDate) {
          queryObj.createdAt = {};
          if (startDate) queryObj.createdAt.$gte = new Date(startDate);

          if (endDate) {
            let end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // ✅ include full day
            queryObj.createdAt.$lte = end;
          }
    }


     // ✅ Top-level status filter (assignment.status)
    if (status) {
      queryObj.status = status;
    }
    // ✅ Dynamic filters (support nested fields in lead_details)
    for (const key in filters) {
      if (filters[key]) {
        if ([
          "phone", 
          "email", 
          "name", 
          "source", 
          "lead_status", 
          "lead_type",
          "location" , 
          "preferred_floor", 
          "status",
          "preferred_configuration",
          "property_status"
        ].includes(key)) {
          queryObj[`lead_details.${key}`] = filters[key]; // nested field
        } else {
          queryObj[key] = filters[key]; // top-level field
        }
      }
    }

    const assigns = await Assign.find(queryObj);

    return res.status(200).json({
      success: true,
      count: assigns.length,
      data: assigns,
    });
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
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
    const queryObj = { assignee_id };
    const { startDate, endDate, ...filters } = req.query;

    // ✅ Date range filter (based on assignment.createdAt)
    if (startDate || endDate) {
      queryObj.createdAt = {};
      if (startDate) queryObj.createdAt.$gte = new Date(startDate);

      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full day
        queryObj.createdAt.$lte = end;
      }
    }

    // ✅ Dynamic filters (nested in lead_details OR top-level)
    for (const key in filters) {
      if (filters[key]) {
        if (
          [
            "phone",
            "email",
            "name",
            "source",
            "status",            
            "lead_status",
            "lead_type",
            "location",
            "preferred_floor",
            "preferred_configuration",
            "property_status"
          ].includes(key)
        ) {
          queryObj[`lead_details.${key}`] = filters[key]; // nested field
        } else {
          queryObj[key] = filters[key]; // top-level field
        }
      }
    }

    // ✅ Apply filters in the query
    const assigns = await Assign.find(queryObj);

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



exports.getAssignmentHistoryById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Assignment ID is required',
    });
  }

  try {
    const assignment = await Assign.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment.history,
    });
  } catch (error) {
    console.error('❌ Error fetching assignment history:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

exports.getMultipleAssigns = async(req , res) => {
  try {
    const {assign_ids} = req.body;
    if(!assign_ids || !Array.isArray(assign_ids) || assign_ids.length === 0){
      return res.status(400).json({ success: false, message: "Assign id array is required" });
    }
    const assigns = await Assign.find({_id: { $in: assign_ids}});
    return res.status(200).json({
      success: true,
      data: assigns
    });
  } catch (error) {
      console.error("Error in geting bulk assign:", error);
      return res.status(500).json({ success: false, message: "Server error" });
  }
}