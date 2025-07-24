const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign.model');
const User = require('../models/user.model');

// Create Campaign
router.post('/campaigns', async (req, res) => {
  const { name, source, telecallerIds, auto_assign } = req.body;

  if (!name || !source || !Array.isArray(telecallerIds)) {
    return res.status(400).json({ message: 'Name, source & telecallerIds required.' });
  }

  // Validate telecallers
  const telecallers = await User.find({ _id: { $in: telecallerIds }, role: 'telecaller' });
  if (telecallers.length !== telecallerIds.length) {
    return res.status(400).json({ message: 'One or more telecaller IDs are invalid.' });
  }

  const campaign = new Campaign({
    name,
    source,
    telecallers: telecallerIds,
    auto_assign: !!auto_assign
  });

  await campaign.save();
  res.status(201).json({ message: 'Campaign created.', campaign });
});

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  const campaigns = await Campaign.find().populate('telecallers');
  if (!campaigns.length) {
    return res.status(404).json({ message: 'No campaigns found.' });
  }
  res.status(200).json({ campaigns });
});

// Update Campaign
router.patch('/campaigns/:id', async (req, res) => {
  const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found.' });
  res.status(200).json({ message: 'Updated.', campaign: updated });
});

module.exports = router;
