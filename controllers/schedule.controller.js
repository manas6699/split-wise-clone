const mongoose = require('mongoose');
const schedule = require('../models/schedule.model'); 
const Assign = require('../models/assign.model');

exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await schedule.find();
        res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.getSchedulesByAssignee = async (req, res) => {
  try {
    const { assigneeId } = req.params; // e.g., /schedules/:assigneeId

    // Make sure it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ message: 'Invalid assignee ID' });
    }

    const schedules = await schedule.find({
      assignee_id: new mongoose.Types.ObjectId(assigneeId)
    }).sort({ start: 1 }); // optional: sort by start date

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAssignIdsfromSchedule = async (req, res) => {
  try {
    const { assigneeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // .distinct returns an array of unique strings/IDs: ["id1", "id2"]
    const assignIds = await schedule.distinct('assign_id', {
      assignee_id: assigneeId
    });

    const activeAssignIds = await Assign.distinct('_id', { 
      status: "assigned",
      assignee_id:assigneeId
    });

    // Using a Set handles duplicates if an ID exists in both lists
    const combinedIds = [...new Set([...assignIds, ...activeAssignIds])];

   res.status(200).json({
      success: true,
      count: combinedIds.length,
      data: combinedIds
    });
  } catch (error) {
    console.error('Error fetching assign IDs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// exports.getFullAssignDataFromSchedule = async (req, res) => {
//   try {
//     const { assigneeId } = req.params;

//     // 1. Validate ID
//     if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
//       return res.status(400).json({ message: 'Invalid ID' });
//     }

//     // 2. Get unique assign_ids from the Schedules
//     const scheduleAssignIds = await schedule.distinct('assign_id', {
//       assignee_id: assigneeId
//     });

//     // 3. Get all _ids from Assigns where status is "assigned"
//     const activeAssignIds = await Assign.distinct('_id', { 
//       status: "assigned",
//       assignee_id:assigneeId
//     });

//     // 4. Combine into a unique list of IDs
//     const combinedIds = [...new Set([...scheduleAssignIds, ...activeAssignIds])];

//     // 5. Fetch the FULL documents for all these IDs
//     // We use $in to find any document whose _id is in our combined list
//     const fullData = await Assign.find({
//       _id: { $in: combinedIds }
//     })
//     .sort({ createdAt: -1 }); // Optional: show newest first

//     res.status(200).json({
//       success: true,
//       count: fullData.length,
//       scheduleLeadCount : scheduleAssignIds.length,
//       untouchedLeadCount: activeAssignIds.length,
//       data: fullData
//     });
//   } catch (error) {
//     console.error('Error fetching full assign data:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.getFullAssignDataFromSchedule = async (req, res) => {
  try {
    const { assigneeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // 1. Get Today's Date String
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Fetch TODAY'S SCHEDULES (Regex for String dates)
    const todaysSchedules = await schedule.find({
      assignee_id: new mongoose.Types.ObjectId(assigneeId),
      start: { $regex: `^${todayStr}` } 
    }).sort({ start: 1 }); // Sorted by time

    const scheduleAssignIds = todaysSchedules.map(s => s.assign_id.toString());

    // 3. Fetch UNTOUCHED LEADS (Status: assigned)
    const activeAssignsData = await Assign.find({
      assignee_id: new mongoose.Types.ObjectId(assigneeId),
      status: "assigned"
    }).sort({ updatedAt: -1 }); // Sorted by recent updates

    // 4. Fetch FULL Assign Docs for Scheduled Leads
    const scheduledLeadsFullData = await Assign.find({
      _id: { $in: scheduleAssignIds }
    });

    const sortedScheduledData = scheduleAssignIds.map(id => 
      scheduledLeadsFullData.find(doc => doc._id.toString() === id)
    ).filter(Boolean);

    // 5. MERGE: Untouched (Assigned) first, then Scheduled Today
    const finalData = [
      ...activeAssignsData,
      ...sortedScheduledData.filter(s => !activeAssignsData.some(a => a._id.toString() === s._id.toString()))
    ];

    res.status(200).json({
      success: true,
      untouchedLeadCount: activeAssignsData.length,
      scheduleLeadCount: finalData.length - activeAssignsData.length,
      data: finalData
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};