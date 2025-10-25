const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// ✅ 1. Create a flexible schema using strict: false
const dynamicSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SheetData = mongoose.model("SheetData", dynamicSchema);

// ✅ 2. Route to receive Google Sheets webhook data
router.post("/metawebhook", async (req, res) => {
  try {
    // Log full payload (helps debugging)
    console.log("📥 Incoming data:", req.body);

    // Validate at least some data exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Empty payload received",
      });
    }

    // ✅ Store raw payload dynamically
    const newEntry = new SheetData(req.body);
    await newEntry.save();

    console.log("✅ Data stored successfully");
    res.status(200).json({ success: true, message: "Data stored successfully" });
  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
