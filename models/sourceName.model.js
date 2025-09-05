const mongoose = require("mongoose");

const sourceNameSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sourceName", sourceNameSchema);
