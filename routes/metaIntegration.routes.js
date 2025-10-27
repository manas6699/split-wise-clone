const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch"); // or axios if you prefer
const router = express.Router();

// ✅ 1. Flexible Schema (stores any structure)
const dynamicSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SheetData = mongoose.model("SheetData", dynamicSchema);

// ✅ 2. Google Sheets Webhook Receiver
router.post("/metawebhook", async (req, res) => {
  try {
    console.log("📥 Incoming data:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Empty payload received",
      });
    }

    // ✅ Store payload in MongoDB
    const newEntry = new SheetData(req.body);
    await newEntry.save();
    console.log("✅ Data stored successfully in MongoDB");

    // ✅ Forward same data to n8n Webhook
    try {
      const n8nResponse = await fetch("https://n8n.mmrrealty.co.in/webhook/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      if (!n8nResponse.ok) {
        console.error("⚠️ Failed to forward data to n8n:", n8nResponse.statusText);
      } else {
        console.log("📤 Data successfully forwarded to n8n");
      }
    } catch (n8nError) {
      console.error("❌ Error forwarding to n8n:", n8nError);
    }

    // ✅ Respond to Google Sheets or source service
    res.status(200).json({ success: true, message: "Data stored and sent to n8n" });
  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
