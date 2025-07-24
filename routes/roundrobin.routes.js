const express = require('express');
const router = express.Router();
const RoundRobinState = require('../models/roundrobin.model');

router.get('/round-robin', async (req, res) => {
  const states = await RoundRobinState.find().populate('campaignId');
  res.status(200).json({ states });
});

router.patch('/round-robin/:campaignId/reset', async (req, res) => {
  const { campaignId } = req.params;
  const state = await RoundRobinState.findOneAndUpdate(
    { campaignId },
    { lastAssignedIndex: 0 },
    { new: true }
  );
  if (!state) return res.status(404).json({ message: 'Not found.' });
  res.status(200).json({ message: 'Reset.', state });
});

module.exports = router;
