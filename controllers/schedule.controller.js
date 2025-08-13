const mongoose = require('mongoose');
const schedule = require('../models/schedule.model'); 

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