const User = require('../models/user.model');

const allGroupHandler = async (req, res) => {
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
}

module.exports = allGroupHandler;