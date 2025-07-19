const mongoose = require('mongoose');
const { Schema } = mongoose;
const AssignSchema = new Schema(
  {
    lead_id: {
      type: String,
      required: true,
    },
    telecaller_id: {
      type: String,
      required: true,
    },
    telecaller_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'reassigned'],
      default: 'assigned',
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
      createdAt: Date,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assign', AssignSchema);
