const express = require('express');
const router = express.Router();
const Group = require('../models/groups.model');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');
const getMembersinaGroup = require('../controllers/getAllMembers.controller')

// Create a new group
// the user who created the group is automatically added in members position
router.post('/create/group', authMiddleware, async (req, res) => {
  try {
    const { groupName, members } = req.body;
    const { id: creatorId, name: creatorName } = req.user; // Extract creator's ID and name

    // Validate input
    if (!groupName || !Array.isArray(members)) {
      return res.status(400).json({ message: 'Group name and members are required.' });
    }

    // Ensure creator is part of the members list
    const updatedMembers = Array.from(new Set([...members, creatorId]));

    if (updatedMembers.length < 2) {
      return res.status(400).json({ message: 'At least two unique members are required, including the creator.' });
    }

    // Create group with `created_by` field
    const newGroup = new Group({
      groupName,
      created_by: { user_id: creatorId, name: creatorName },
      users: updatedMembers,
    });

    const savedGroup = await newGroup.save();

    // Update each user with the group reference
    await Promise.all(
      updatedMembers.map(memberId =>
        User.findByIdAndUpdate(
          memberId,
          { $addToSet: { groups: savedGroup._id } }, // Avoid duplicate group references
          { new: true }
        )
      )
    );

    res.status(201).json({
      message: 'Group created successfully!',
      group: savedGroup,
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


router.route('/allmembers/:group_id' , authMiddleware).get(getMembersinaGroup);

  
module.exports = router;
