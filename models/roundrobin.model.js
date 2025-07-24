const mongoose = require('mongoose');

const roundRobinStateSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    unique: true,
    required: true
  },
  lastAssignedIndex: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('RoundRobinState', roundRobinStateSchema);
