
const User = require('../models/user.model'); 

exports.saveFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ message: 'Missing userId or fcmToken' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fcmToken = fcmToken;
    await user.save();

    return res.status(200).json({ message: 'FCM token saved' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
