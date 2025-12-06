const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      required: [true, 'Phone number is required'],
    },
    upload_by: {
      type: String,
      required: true,
    },
    upload_type: {
      type: String,
      required: true,
    },
    source: {
      type: String,
    },
    projectSource: {
      type: String,
    },
    alternate_phone: {
      type: String,
    },
    client_budget: {
      type: String,
    },
    interested_project: {
      type: String,
    },
    location: {
      type: String,
    },
    preferred_floor: {
      type: String,
    },
    preferred_configuration: {
      type: String,
    },
    furnished_status: {
      type: String,
    },
    property_status: {
      type: String,
    },
    lead_status: {
      type: String,
    },
    subdisposition: {
      type: String,
    },
    lead_type: {
      type: String,
    },
    comments: {
      type: String,
    },
    schedule_date: {
      type: String,
      default: null,
    },
    schedule_time: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['assigned', 'not-assigned', 'processed', 'reassigned', 'auto-assigned'],
      default: 'not-assigned',
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignee_name: {
      type: mongoose.Schema.Types.String,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leads', leadSchema);