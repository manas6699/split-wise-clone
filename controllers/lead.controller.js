const Leads = require('../models/lead.model');
const Campaign = require('../models/campaign.model');
const RoundRobinState = require('../models/roundrobin.model');
const Assign = require('../models/assign.model');
const mongoose = require("mongoose");
const User = require('../models/user.model');
const checkPhoneNumber = require('../utils/checkPhoneNumber');

const Schedule = require('../models/schedule.model');


exports.createLead = async (req, res) => {
  const { name, email, phone, source , projectSource } = req.body;

  // Step 1: Validate required fields
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
    // Step 2: Create new lead with default status
    const newLead = new Leads({
      name,
      email,
      phone,
      source,
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
      lead_status,
    } = req.query;

    const query = {};

    // 🔍 Search by name, email or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // 🎯 Apply filters if provided
    if (status) query.status = status;
    if (source) query.source = source;
    if (lead_status) query.lead_status = lead_status;

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