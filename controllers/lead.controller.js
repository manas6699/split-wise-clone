const Leads = require('../models/lead.model');
const Campaign = require('../models/campaign.model');
const RoundRobinState = require('../models/roundrobin.model');
const Assign = require('../models/assign.model');
const mongoose = require("mongoose");
const User = require('../models/user.model');
// const checkPhoneNumber = require('../utils/checkPhoneNumber');
const UUIDDD = require('../utils/UUIDDD')

const Schedule = require('../models/schedule.model');


exports.createLead = async (req, res) => {
  const { name, email, phone, source , projectSource, upload_by , upload_type } = req.body;

  // Step 1: Validate required fields
  if (!name || !phone || !source || !upload_by || !upload_type) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Step 2: Create new lead with default status
    const newLead = new Leads({
      name,
      email,
      phone,
      source,
      upload_type,
      upload_by,
      status: 'not-assigned',
      projectSource
    });

    // Step 3: Check if campaign supports auto-assign
    const campaign = await Campaign.findOne({ source, auto_assign: true });

    if (campaign?.telecallers?.length > 0) {
      const telecallers = campaign.telecallers;
      let state = await RoundRobinState.findOne({ campaignId: campaign._id });
      let index = 0;

      // Step 4: Round-robin logic for telecaller assignment
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

      // Step 5: Assign lead to telecaller
      const assignedTelecallerId = telecallers[index];
      const telecaller = await User.findById(assignedTelecallerId, 'name');

      newLead.assigned_to = assignedTelecallerId;
      newLead.assignee_name = telecaller?.name || '';
      newLead.status = 'auto-assigned';

      // Step 6: Create assignment record
      await Assign.create({
        lead_id: newLead._id.toString(),
        assignee_id: assignedTelecallerId,
        assignee_name: telecaller?.name || '',
        status: 'auto-assigned',
        remarks: 'auto-assigned',
        dumb_id: UUIDDD(),
        history: [],
        lead_details: {
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          source: newLead.source,
          projectSource: newLead.projectSource,
          upload_by: newLead.upload_by,
          upload_type: newLead.upload_type,
          status: newLead.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Step 7: Send notification to assigned telecaller via socket.io
      const io = req.app.get('io');
      if (io && telecaller?.id) {
        console.log(`Emitting lead-auto-assigned event to telecaller: ${telecaller.name} and ID: ${telecaller.id}`); // Debug log
      }
      io?.to(telecaller?.id).emit('lead-auto-assigned', {
        title: 'New Lead Assigned',
        message: `A new lead has been auto-assigned to you: ${newLead.name}`,
        leadId: newLead._id.toString(),
      });
      console.log(`Lead auto-assigned to telecaller: ${telecaller?.name || 'Unknown'}`);
    }

    // Step 8: Save lead in DB
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

exports.createLead2 = async (req, res) => {
  const { name, email, phone, source , projectSource, upload_by , upload_type } = req.body;

  // Step 1: Validate required fields
  if (!name || !phone || !source || !upload_by || !upload_type) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Step 2: Create new lead with default status
    const newLead = new Leads({
      name,
      email,
      phone,
      source,
      upload_type,
      upload_by,
      status: 'not-assigned',
      projectSource
    });

    // Step 8: Save lead in DB
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
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      status,
      source,
      projectSource,
      lead_status,
      subdisposition,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // 🔍 Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // 🎯 Apply filters if provided
    if (status) query.status = status;
    if (projectSource) query.projectSource = projectSource;
    if (source) query.source = source;
    if (lead_status) query.lead_status = lead_status;
    if (subdisposition) query.subdisposition = subdisposition;

    // 🗓️ Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // include full end day by setting time to 23:59:59
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // 📦 Fetch filtered leads with pagination
    const leads = await Leads.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Leads.countDocuments(query);

    res.status(200).json({
      message: 'Leads fetched successfully',
      leads,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.getLeadbyId = async (req, res) => {
 const { assigneeId } = req.params;
  const { status } = req.query;

  try {
    // Construct query
    const query = { assignee_id: assigneeId };

    // If status is present and not empty
    if (status && typeof status === 'string' && status.trim() !== '') {
      query.status = status.trim().toLowerCase(); // Case normalization
    }

    console.log('💡 Final Mongo Query:', query);

    // Query the database
    const leads = await Assign.find(query).populate('lead_id');

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }

};


// this handles fixcard data
exports.getLeadDetailsbyId = async (req, res) => {
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

exports.getLeadDetailsbyIdfromAssigns = async (req, res) => {
  const { id } = req.params;

  try {
    // We search the Assignments collection instead of Leads
    // findById automatically looks for the "_id" field
    const assignment = await Assign.findOne({ lead_id: id });

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment record not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Lead assignment details fetched successfully', 
      data: assignment 
    });

  } catch (error) {
    console.error('Error fetching assignment details:', error);
    
    // Check if the error is due to an invalid MongoDB ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.updateLeadDetails = async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    "alternate_phone",
    "client_budget",
    "interested_project",
    "location",
    "preferred_floor",
    "preferred_configuration",
    "furnished_status",
    "property_status",
    "lead_status",
    "subdisposition",
    "lead_type",
    "comments",
    "status",
    "schedule_date",
    "schedule_time",
    "source",
  ];

  try {
    // 1️⃣ Build updates
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    if (req.body.subdisposition !== undefined) {
      updates.subdisposition = req.body.subdisposition || undefined;
    }

    // 2️⃣ Update Lead
    const updatedLead = await Leads.findByIdAndUpdate(
      id,
      { ...updates, status: "processed" },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // ✅ Step 3: Get assignee from Assigns
    const assign = await Assign.findOne({ lead_id: id }, "assignee_id");
    let assignee_name = "Unknown";

    if (assign && assign.assignee_id) {
      const assigneeDoc = await User.findById(assign.assignee_id, "name");
      assignee_name = assigneeDoc ? assigneeDoc.name : "Unknown";
    }

    // 4️⃣ Update Assign(s) linked to this Lead
    await Assign.updateMany(
      { lead_id: id },
      {
        $set: {
          "lead_details.alternate_phone": updatedLead.alternate_phone || "",
          "lead_details.client_budget": updatedLead.client_budget || "",
          "lead_details.interested_project":
            updatedLead.interested_project || "",
          "lead_details.location": updatedLead.location || "",
          "lead_details.preferred_floor": updatedLead.preferred_floor || "",
          "lead_details.preferred_configuration":
            updatedLead.preferred_configuration || "",
          "lead_details.furnished_status": updatedLead.furnished_status || "",
          "lead_details.property_status": updatedLead.property_status || "",
          "lead_details.lead_status": updatedLead.lead_status || "",
          "lead_details.subdisposition": updatedLead.subdisposition || "",
          "lead_details.status": "processed",
          status: "processed",
          "lead_details.lead_type": updatedLead.lead_type || "",
          "lead_details.source": updatedLead.source || "",
          "lead_details.comments": updatedLead.comments || "",
          "lead_details.schedule_date": updatedLead.schedule_date || "",
          "lead_details.schedule_time": updatedLead.schedule_time || "",
          "lead_details.updatedAt": new Date(),
        },
        $push: {
          history: {
            lead_id: id,
            assignee_name,
            updatedAt: new Date(),
            status: updatedLead.lead_status || "",
            subdisposition: updatedLead.subdisposition || "",
            remarks: updatedLead.comments || "",
          },
        },
      }
    );

    // 5️⃣ Handle Schedule
    if (updatedLead.schedule_date && updatedLead.schedule_time) {
      // create / update schedule
      const schedule_date = updatedLead.schedule_date;
      const schedule_time = updatedLead.schedule_time;

      const dateObj = new Date(schedule_date);
      const [hour, minute] = schedule_time.split(":").map(Number);

      if (!isNaN(hour) && !isNaN(minute)) {
        const startDate = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(), // zero-based
          dateObj.getDate(),
          hour,
          minute
        );

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 10);

        await Schedule.findOneAndUpdate(
          { lead_id: id },
          {
            title: updatedLead.name || "Lead Schedule",
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            lead_id: id,
            assign_id: assign?._id || null,
            assignee_id: req.body.assignee_id || "",
            remarks: updatedLead.comments || "",
          },
          { upsert: true, new: true, runValidators: true }
        );
      }
    } else {
      // If schedule_date or schedule_time is blank → delete schedule
      await Schedule.deleteOne({ lead_id: id });
    }

    res.status(200).json({
      message: "Lead, Assign, and Schedule updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateLeadBasicInfo = async (req, res) => {
  const { id } = req.params;
  const { name, email, updated_by } = req.body;

  // 1. Validation
  if (!name && !email) {
    return res.status(400).json({ message: 'Please provide at least a name or email to update.' });
  }

  if (email && !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    // 2. Prepare update object dynamically
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    // 3. Update the main Lead document
    const updatedLead = await Leads.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // 4. SYNC: Update associated Assign records & Add History
    // This ensures telecallers see the updated name/email in their logs/history
    const assignUpdates = {};
    if (name) assignUpdates['lead_details.name'] = name;
    if (email) assignUpdates['lead_details.email'] = email;

    // Prepare history entry using the updated_by name from req.body
    const historyEntry = {
      lead_id: id,
      assignee_name: updated_by || 'System', // Captures who updated the fields
      updatedAt: new Date(),
      status: updatedLead.status || 'processed',
      remarks: `Lead details (Name/Email) updated by ${updated_by}`,
    };

    // Update Assign records: set new details and push to history
    await Assign.updateMany(
      { lead_id: id },
      { 
        $set: assignUpdates,
        $push: { history: historyEntry }
      }
    );

    res.status(200).json({
      message: 'Lead basic info updated successfully',
      lead: updatedLead,
    });

  } catch (error) {
    console.error('Error updating lead basic info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBulkLeads = async (req, res) => {
    try {
        const { lead_ids } = req.body;

        if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
            return res.status(400).json({ success: false, message: "lead_ids array is required" });
        }
        // ✅ Find leads by _id
        const leads = await Leads.find({ _id: { $in: lead_ids } });

        return res.status(200).json({
            success: true,
            data: leads,
        });
    } catch (error) {
        console.error("Error in getBulkLeads:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};