const express = require('express');
const router = express.Router();
const Group = require('../models/groups.model');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');

// Create a new group
router.post('/create/group', authMiddleware, async (req, res) => {
  try {
    const { groupName, members } = req.body;

    // Input validation
    if (!groupName || !members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ message: 'Group name and at least two members are required.' });
    }

    // Create and save the group
    const newGroup = new Group({
      groupName,
      users: members
    });

    const savedGroup = await newGroup.save();

    // Update each user with the group reference
    await Promise.all(
      members.map(memberId =>
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
