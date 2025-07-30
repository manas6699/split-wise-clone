const mongoose = require('mongoose');
const { Schema } = mongoose;
const AssignSchema = new Schema(
  {
    lead_id: {
      type: String,
      required: true,
    },
    assignee_id: {
      type: String,
      required: true,
    },
    assignee_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'reassigned' , 'not-assigned' , 'auto-assigned'],
      default: 'not-assigned',
    },
    remarks: {
      type: String,
    },
    history: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    lead_details: {  // ✅ new embedded object
      name: String,
      email: String,
      phone: String,
      source: String,
      status: String,
      comments: String,
      location: String,
      alternate_phone: String,
      client_budget: String,
      furnished_status: String,
      interested_project: String,
      lead_status: String,
      preferred_configuration: String,
      preferred_floor: String,
      property_status: String,
      createdAt: Date,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assign', AssignSchema);
