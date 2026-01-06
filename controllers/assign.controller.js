
const Lead = require('../models/lead.model');
const Assign = require('../models/assign.model');
const UUIDDD = require('../utils/UUIDDD')

/**
 * 📌 Create an assignment + update lead status
 */

exports.createAssignment = async (req, res) => {
  const { lead_id, assignee_id, assignee_name, asssigned_by , status, remarks, history } = req.body;

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
      assign_mode: 'Atomic',
      asssigned_by,
      dumb_id: UUIDDD(),
      remarks: remarks || '',
      history: history || [],
      lead_details: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        projectSource: lead.projectSource,
        upload_by: lead.upload_by,
        upload_type: lead.upload_type,
        status: lead.status,
        lead_type: lead.lead_type,
        lead_status: lead.lead_status,
        subdisposition: lead.subdisposition,
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
  const { lead_ids, assignee_id, assignee_name, asssigned_by , status, remarks, history } = req.body;

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
      assign_mode: 'Bulk',
      asssigned_by: asssigned_by,
      status: status || 'assigned',
      remarks: remarks || '',
      dumb_id: UUIDDD(),
      history: history || [],
      lead_details: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        projectSource: lead.projectSource,
        upload_by: lead.upload_by,
        upload_type: lead.upload_type,
        status: 'assigned',
        lead_type: lead.lead_type,
        lead_status: lead.lead_status,
        subdisposition: lead.subdisposition,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
    }));

    await Assign.insertMany(assignments);

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
    const {
      startDate,
      endDate,
      updatedStartDate,
      updatedEndDate,
      status,
      assignee_name,
      assignee_id,
      ...filters
    } = req.query;

    /* -------------------------------------------------------------------------- */
    /* ✅ Helper Function for $in Support (Handles brackets, quotes, and commas)  */
    /* -------------------------------------------------------------------------- */
    const formatFilterValue = (val) => {
      if (!val) return val;

      // If it's already an array (Node.js does this for ?status=a&status=b)
      if (Array.isArray(val)) {
        return { $in: val };
      }

      if (typeof val === 'string') {
        // Check if string contains comma or looks like an array string ['a','b']
        if (val.includes(',') || val.startsWith('[') || val.endsWith(']')) {
          const cleanValues = val
            .replace(/[\[\]'"]/g, '') // Remove brackets [ ] and quotes ' "
            .split(',')               // Split into array
            .map(item => item.trim()) // Remove extra spaces
            .filter(Boolean);         // Remove empty strings

          return { $in: cleanValues };
        }
      }
      return val;
    };

    /* -------------------------------------------------------------------------- */
    /* ✅ Date Range Filters */
    /* -------------------------------------------------------------------------- */
    if (startDate || endDate) {
      queryObj.createdAt = {};
      if (startDate) queryObj.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = end;
      }
    }

    if (updatedStartDate || updatedEndDate) {
      queryObj.updatedAt = {};
      if (updatedStartDate) queryObj.updatedAt.$gte = new Date(updatedStartDate);
      if (updatedEndDate) {
        const end = new Date(updatedEndDate);
        end.setHours(23, 59, 59, 999);
        queryObj.updatedAt.$lte = end;
      }
    }

    /* -------------------------------------------------------------------------- */
    /* ✅ Top-level Filters */
    /* -------------------------------------------------------------------------- */
    if (status) queryObj.status = formatFilterValue(status);
    if (assignee_name) queryObj.assignee_name = formatFilterValue(assignee_name);
    if (assignee_id) queryObj.assignee_id = formatFilterValue(assignee_id);

    /* -------------------------------------------------------------------------- */
    /* ✅ Dynamic & Nested Filters */
    /* -------------------------------------------------------------------------- */
    const nestedFields = [
      "phone", "email", "name", "source", "projectSource",
      "lead_status", "subdisposition", "lead_type", "location", 
      "preferred_floor", "status", "upload_type", 
      "preferred_configuration", "property_status", "upload_type", "schedule_date"
    ];

    for (const key in filters) {
      if (filters[key]) {
        const formattedValue = formatFilterValue(filters[key]);

        if (nestedFields.includes(key)) {
          queryObj[`lead_details.${key}`] = formattedValue;
        } else {
          queryObj[key] = formattedValue;
        }
      }
    }

    /* -------------------------------------------------------------------------- */
    /* ✅ Query Execution */
    /* -------------------------------------------------------------------------- */
    // Log the query to your terminal to verify the format
    console.log("Database Query:", JSON.stringify(queryObj, null, 2));

    const assigns = await Assign.find(queryObj).sort({ createdAt: -1 });

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
    const { startDate, endDate, updatedStartDate, updatedEndDate, dumb_id, ...filters } = req.query;

    // ✅ Date range filter for createdAt
    if (startDate || endDate) {
      queryObj.createdAt = {};
      if (startDate) queryObj.createdAt.$gte = new Date(startDate);
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = end;
      }
    }

    // ✅ Date range filter for updatedAt
    if (updatedStartDate || updatedEndDate) {
      queryObj.updatedAt = {};
      if (updatedStartDate) queryObj.updatedAt.$gte = new Date(updatedStartDate);
      if (updatedEndDate) {
        let end = new Date(updatedEndDate);
        end.setHours(23, 59, 59, 999);
        queryObj.updatedAt.$lte = end;
      }
    }

    if (dumb_id) {
      queryObj.dumb_id = dumb_id;
    }

    // ✅ Dynamic filters with Array ($in) support
    for (const key in filters) {
      let value = filters[key];

      if (value) {
        // 1. Handle Array Conversion: 
        // If frontend sends ?lead_status=Follow Up&lead_status=Unqualified, Express makes it an array.
        // If frontend sends a stringified array like '["Follow Up", "Unqualified"]', we parse it.
        if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = value.replace(/"/g, ''); // Fallback to clean string
          }
        } else if (typeof value === 'string') {
          value = value.replace(/"/g, ''); // Clean quotes from standard strings
        }

        // 2. Determine if we use direct match or $in operator
        const queryValue = Array.isArray(value) ? { $in: value } : value;

        // 3. Map to correct field path
        const leadDetailFields = [
          "phone", "email", "name", "source", "status", "lead_status",
          "subdisposition", "lead_type", "location", "preferred_floor",
          "preferred_configuration", "property_status", "upload_type", "schedule_date"
        ];

        if (leadDetailFields.includes(key)) {
          queryObj[`lead_details.${key}`] = queryValue;
        } else {
          queryObj[key] = queryValue;
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