const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    required: true 
  },
  telecallers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  auto_assign: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
