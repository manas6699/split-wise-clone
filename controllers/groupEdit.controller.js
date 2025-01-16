const Group = require('../models/groups.model');

// Edit Group Handler
const editGroupHandler = async (req, res) => {
  try {
    const { group_id } = req.params; // Get the group ID from the route parameters
    const { groupName, users } = req.body; // Destructure updated fields from the request body

    const { id: creatorId, name: creatorName } = req.user; // Extract creator's ID and name

    console.log('creatorId', creatorId);
    console.log('creatorName', creatorName);

    // Validate input
    if (!groupName || !users || !Array.isArray(users)) {
      return res.status(400).json({ message: 'Group name and users must be provided.' });
    }

    // Ensure creator is part of the members list
    const updatedMembers = Array.from(new Set([...users, creatorId]));

    if (updatedMembers.length < 2) {
      return res.status(400).json({ message: 'At least two unique members are required, including the creator.' });
    }

    // Find the group by ID
    const existingGroup = await Group.findById(group_id);

    // If the group doesn't exist
    if (!existingGroup) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    // Update the group fields
    existingGroup.groupName = groupName;
    existingGroup.users = updatedMembers;

    // Save the updated group
    const updatedGroup = await existingGroup.save();

    // Send success response
    res.status(200).json({
      message: 'Group updated successfully.',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Error editing group:', error);
    res.status(500).json({ message: 'An error occurred while editing the group.' });
  }
};

module.exports = editGroupHandler;
