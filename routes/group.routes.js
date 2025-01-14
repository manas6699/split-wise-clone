const express = require('express');
const router = express.Router();
const Group = require('../models/groups.model');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');

// Create a new group
// the user who created the group is automatically added in members position
router.post('/create/group', authMiddleware, async (req, res) => {
  try {
    const { groupName, members } = req.body;

    // Extract the user ID of the authenticated user from the middleware
    const creatorId = req.user.id; 

    // Input validation
    if (!groupName || !Array.isArray(members)) {
      return res.status(400).json({ message: 'Group name and members are required.' });
    }

    // Ensure the creator is added to the members list
    const updatedMembers = Array.from(new Set([...members, creatorId])); // Avoid duplicates using Set

    if (updatedMembers.length < 2) {
      return res.status(400).json({ message: 'At least two unique members are required, including the creator.' });
    }

    // Create and save the group
    const newGroup = new Group({
      groupName,
      users: updatedMembers
    });

    const savedGroup = await newGroup.save();

    // Update each user with the group reference
    await Promise.all(
      updatedMembers.map(memberId =>
        User.findByIdAndUpdate(
          memberId,
          { $addToSet: { groups: savedGroup._id } }, // $addToSet avoids duplicates
          { new: true }
        )
      )
    );

    res.status(201).json({
      message: 'Group created successfully!',
      group: savedGroup
    });

  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/user/groups', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id; // Assuming `authMiddleware` attaches `user.id` to the request object

      console.log('userId:', userId);
  
      // Find user and populate groups
      const userWithGroups = await User.findById(userId).populate('groups', 'groupName users');
  
      if (!userWithGroups) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(200).json({
        message: 'User groups retrieved successfully.',
        groups: userWithGroups.groups
      });
  
    } catch (err) {
      console.error('Error fetching user groups:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

module.exports = router;
