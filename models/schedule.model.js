// models/schedule.model.js
const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    start: {
      type: String, // you can change to Date if needed
      required: true
    },
    end: {
      type: String, // you can change to Date if needed
      required: true
    },
    assignee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", ScheduleSchema);
