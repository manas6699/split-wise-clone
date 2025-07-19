const express = require('express');
const User = require('../models/user.model');

const router = express.Router();

router.get('/telecallers', async (req, res) => {
  try {
    const telecallers = await User.find({ role: 'telecaller' });
    res.status(200).json({ success: true, data: telecallers.map(user => ({
        id: user._id,
        name: user.name,
        role: user.role,
        online: user.online
      })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
});

router.get('/salespersons', async (req, res) => {
  try {
    const salespersons = await User.find({ role: 'salesperson' });
    res.status(200).json({ success: true, data: salespersons.map(user => ({
        id: user._id,
        name: user.name,
        role: user.role,
        online: user.online
      })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
});

module.exports = router;
