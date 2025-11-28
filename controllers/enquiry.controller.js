const mongoose = require("mongoose");

const olSchema = new mongoose.Schema({}, { strict: false, collection: "oL" });
const conversationSchema = new mongoose.Schema({} , {strict: false , collation: "conversation"});
const leadWithLatestDispositionSchema = new mongoose.Schema({}, { strict: false, collection: "LeadwithLatestDisposition" });

const Assign = require('../models/assign.model');
const Leads = require("../models/lead.model");

const OL = mongoose.model("oL", olSchema);
const Conversation  = mongoose.model("Conversation" , conversationSchema);
const LeadWithLatestDisposition = mongoose.model("LeadwithLatestDisposition", leadWithLatestDispositionSchema);

exports.getOldLeads = async (req, res) => {
  try {
    let { 
      page = 1, 
      limit = 100, 
      startDate, 
      endDate, 
      username, 
      location, 
      name, 
      source , 
      phone ,
      disposition,
      pname
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // Build query object
    const query = {};

    // ✅ Date range filter (parse enq_date string)
if (startDate || endDate) {
  const start = startDate ? new Date(startDate.split("-").reverse().join("-")) : null;
  const end = endDate ? new Date(endDate.split("-").reverse().join("-")) : null;

  query.$expr = {};
  query.$expr.$and = [];

  if (start) {
    query.$expr.$and.push({
      $gte: [
        {
          $dateFromString: {
            dateString: "$enq_date",
            format: "%d-%m-%Y %H:%M", // 👈 matches "27-06-2025 14:31"
            onError: null,
            onNull: null
          }
        },
        start
      ]
    });
  }

  if (end) {
    query.$expr.$and.push({
      $lte: [
        {
          $dateFromString: {
            dateString: "$enq_date",
            format: "%d-%m-%Y %H:%M",
            onError: null,
            onNull: null
          }
        },
        end
      ]
    });
  }
}


// ✅ Username filter (Username1 OR Username2)
    if (username) {
    query.$or = [
        { Username1: username },
        { Username2: username }
    ];
}

      // disposition filter
    if(disposition){
      query.call_status = {$regex:disposition , $options: "i"};
    }

    // project name filter
    if(pname){
      query.pname = {$regex:pname , $options: "i"};
    }

    // ✅ Location filter (case-insensitive, partial match)
    if (location) {
      query.plocation = { $regex: location, $options: "i" };
    }

    // ✅ Client name filter (case-insensitive, partial match)
    if (name) {
      query.client_name = { $regex: name, $options: "i" };
    }

    // ✅ Source filter
    if (source) {
      query.source = source;
    }

    // phone number filter
    if(phone){
      query.client_contact = phone
    }
    

    // Fetch paginated & filtered data
    const [data, total] = await Promise.all([
      LeadWithLatestDisposition.find(query).skip(skip).limit(limit).sort({ _id: -1 }),
      LeadWithLatestDisposition.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


// telecaller leads
exports.getLeadsByUser = async (req, res) => {
  try {
    const { 
      userId, 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      username, 
      location, 
      name, 
      source, 
      phone,
      disposition
    } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Always require user filter
    const query = {
      $or: [{ matchid1: userId }, { matchid2: userId }],
    };

    // ✅ Date range filter
if (startDate || endDate) {
  const start = startDate ? new Date(startDate.split("-").reverse().join("-")) : null;
  const end = endDate ? new Date(endDate.split("-").reverse().join("-")) : null;

  query.$expr = {};
  query.$expr.$and = [];

  if (start) {
    query.$expr.$and.push({
      $gte: [
        {
          $dateFromString: {
            dateString: "$enq_date",
            format: "%d-%m-%Y %H:%M", // 👈 matches "27-06-2025 14:31"
            onError: null,
            onNull: null
          }
        },
        start
      ]
    });
  }

  if (end) {
    query.$expr.$and.push({
      $lte: [
        {
          $dateFromString: {
            dateString: "$enq_date",
            format: "%d-%m-%Y %H:%M",
            onError: null,
            onNull: null
          }
        },
        end
      ]
    });
  }
}

    // disposition filter
    if(disposition){
      query.call_status = {$regex:disposition , $options: "i"};
    }
    // ✅ Location filter (case-insensitive, partial match)
    if (location) {
      query.plocation = { $regex: location, $options: "i" };
    }

    // ✅ Client name filter (case-insensitive, partial match)
    if (name) {
      query.client_name = { $regex: name, $options: "i" };
    }

    // ✅ Source filter
    if (source) {
      query.source = source;
    }

    // ✅ Phone filter
    if (phone) {
      query.client_contact = { $regex: phone, $options: "i" }; // partial match
    }

    // ✅ Username filter (case-insensitive, partial match on Username1 or Username2)
    if (username) {
      query.$or = [
        { ...query.$or[0], Username1: { $regex: username, $options: "i" } },
        { ...query.$or[1], Username2: { $regex: username, $options: "i" } }
      ];
    }

    // ✅ Run queries in parallel
    const [data, total] = await Promise.all([
      LeadWithLatestDisposition.find(query).skip(skip).limit(parseInt(limit)).lean(),
      LeadWithLatestDisposition.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: data.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("Error fetching leads by user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// assign old leads to telecallers
exports.createOldAssigntoNew = async (req, res) => {
  const { lead_id, assignee_id, assignee_name, remarks , upload_by } = req.body;

  if (!lead_id || !assignee_id || !assignee_name) {
    return res.status(400).json({
      success: false,
      message: 'lead_id, assignee_id, and assignee_name are required.',
    });
  }

  try {
    // ✅ Find and update the old lead
    const oldLead = await LeadWithLatestDisposition.findByIdAndUpdate(
      lead_id,
      { status: 'assigned' },
      { new: true }
    );

    if (!oldLead) {
      return res.status(404).json({
        success: false,
        message: 'Old Lead not found.',
      });
    }

    // ✅ first insert into Leads collection
    const newLead = new Leads({
      name: oldLead.client_name,
      email: oldLead.client_mail,
      phone: oldLead.client_contact,
      source: oldLead.source,
      projectSource: oldLead.pname || "",
      schedule_date: null,
      schedule_time: "",
      status: "assigned",
       upload_type: "old",
       upload_by: upload_by,
    });

    await newLead.save();

    // ✅ create assignment record using newLead._id
    let history = `Old lead of id : ${lead_id} has been assigned to ${assignee_name} with remark : ${remarks}`;

    const assign = new Assign({
      lead_id: newLead._id, // ✅ use the new lead’s _id here
      assignee_id,
      assignee_name,
      status: 'assigned',
      remarks: remarks || '',
      history: [history],
      lead_details: {
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        source: newLead.source,
        status: newLead.status,
      },
    });

    await assign.save();

    // ✅ delete old lead from LeadWithLatestDisposition
    await LeadWithLatestDisposition.findByIdAndDelete(lead_id);

    // ✅ emit socket event
    const io = req.app.get('io');
    io.to(assignee_id).emit('lead-assigned', {
      title: 'New Lead Assigned',
      message: `A new lead has been assigned to you: ${newLead.name || 'Lead'}`,
      leadId: newLead._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Old Lead assigned successfully, new lead created & assignment recorded , & old lead deleted',
      data: {
        newLead,
        assign,
      },
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


exports.getCombinedCount = async (req, res) => {
  try {
    // run both counts in parallel for efficiency
    const [leadCount, assignCount] = await Promise.all([
      LeadWithLatestDisposition.countDocuments(),
      Assign.countDocuments(),
    ]);

    const totalCount = leadCount + assignCount;

    return res.status(200).json({
      success: true,
      counts: {
        leadCount,
        assignCount,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching combined count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// New collection to store final joined docs
// legacy endpoint controller alart!!!!!!!!! Don't touch it!!
// exports.buildLeadWithDisposition = async (req, res) => {
//   try {
//     const batchSize = 1000; // process 1k leads at a time
//     const total = await OL.countDocuments();

//     for (let skip = 0; skip < total; skip += batchSize) {
//       const pipeline = [
//         { $skip: skip },
//         { $limit: batchSize },

//         { $addFields: { eidStr: { $toString: "$eid" } } },

//         {
//           $lookup: {
//             from: "conversation",
//             localField: "eidStr",
//             foreignField: "eid",
//             as: "conversations"
//           }
//         },
//         { $unwind: { path: "$conversations", preserveNullAndEmptyArrays: true } },
//         { $sort: { "conversations.created_at": -1 } },
//         {
//           $group: {
//             _id: "$eid",
//             olData: { $first: "$$ROOT" },
//             latestConversation: { $first: "$conversations" }
//           }
//         },
//         {
//           $replaceRoot: {
//             newRoot: { $mergeObjects: ["$olData", "$latestConversation"] }
//           }
//         },
//         { $project: { eidStr: 0, conversations: 0 } },
//         {
//           $merge: {
//             into: "LeadwithLatestDisposition",
//             whenMatched: "replace",
//             whenNotMatched: "insert"
//           }
//         }
//       ];

//       await OL.aggregate(pipeline, { allowDiskUse: true });
//     }

//     const data = await LeadWithLatestDisposition.find().lean();

//     res.json({
//       success: true,
//       count: data.length,
//       data
//     });
//   } catch (err) {
//     console.error("Error building LeadwithLatestDisposition:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };






