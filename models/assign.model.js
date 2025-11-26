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
    asssigned_by: {
      type: String,
    },
    assign_mode:{
      type : String,
    },
    dumb_id:{
      type: String,
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
      projectSource: String,
      status: String,
      lead_type: String,
      comments: String,
      location: String,
      alternate_phone: String,
      client_budget: String,
      furnished_status: String,
      interested_project: String,
      lead_status: String,
      upload_by: String,
      upload_type: String,
      preferred_configuration: String,
      preferred_floor: String,
      property_status: String,
      schedule_date: String,
      schedule_time: String,
      subdisposition: String,
      createdAt: Date,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assign', AssignSchema);
