const mongoose = require('mongoose');
const Group = require('../models/groups.model');

const getMembersInGroup = async (req, res) => {
    try {
        const { group_id } = req.params;

        // Validate Group ID
        if (!mongoose.Types.ObjectId.isValid(group_id)) {
            return res.status(400).json({ message: 'Invalid Group ID format.' });
        }

        const group = await Group.findById(group_id); 

        // console.log('group:', group.users);

        // Handle group not found
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        return res.status(200).json({
            message: 'Group members retrieved successfully.',
            groupName: group.groupName,
            members: group.users
        });

    } catch (err) {
        console.error('Error fetching group members:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = getMembersInGroup;
