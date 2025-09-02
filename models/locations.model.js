const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true,
      unique: true, // prevent duplicate names
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
