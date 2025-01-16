const mongoose = require('mongoose');

const Group = require('../models/groups.model');
const Expense = require('../models/expense.model');


const checkexGrHandler = async (req, res) => {
    try {
        const { group_id } = req.params;

        // Validate Group ID
        if (!mongoose.Types.ObjectId.isValid(group_id)) {
            return res.status(400).json({ message: 'Invalid Group ID format.' });
        }

        const group = await Group.findById(group_id);

        // Handle group not found
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        const expenses = await Expense.find({ group_id: group_id });

        return res.status(200).json({
            message: 'Expenses retrieved successfully.',
            expenses: expenses
        });

    } catch (err) {
        console.error('Error fetching expenses:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}


module.exports = checkexGrHandler;