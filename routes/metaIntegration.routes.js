const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const router = express.Router();

// Flexible Schema
const dynamicSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SheetData = mongoose.model("SheetData", dynamicSchema);
// const BASE_API_URL = 'https://mmrrealty.co.in';
const BASE_API_URL = 'https://split-wise-clone-085p.onrender.com';

// Helper: Clean and normalize phone number → last 10 digits
function extractValidPhone(numberString = "") {
  const digits = numberString.replace(/\D/g, "");
  return digits.slice(-10);
}

router.post("/metawebhook", async (req, res) => {
  try {
    console.log("📥 Incoming Data:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Empty payload received",
      });
    }

    // Extract incoming values
    const {
      name = "",
      phone_number = "",
      email = "",
      project_name = "",
      entry_id = "",
      source = "",
    } = req.body;

    const cleanedPhone = extractValidPhone(phone_number);

    // Capture metadata
    const sourceInfo = {
      "x-source-domain": req.headers["x-source-domain"] || "not provided",
      "x-forwarded-by": req.headers["x-forwarded-by"] || "not provided",
      "referer": req.headers["referer"] || "not provided",
      "origin": req.headers["origin"] || "not provided",
      "user-agent": req.headers["user-agent"] || "unknown",
      "ip":
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "unknown",
    };

    // Store in MongoDB
    await new SheetData({
      ...req.body,
      _sourceMeta: sourceInfo,
      cleanedPhone,
    }).save();

    console.log("✅ MongoDB Save Success");

    // ------------- CALL YOUR LEADS API -------------
    try {
      const leadPayload = {
        name: name,
        email: email,
        phone: cleanedPhone,
        source: project_name,
        projectSource: source,
        upload_by: "system",
        upload_type: "webhook",
      };

      console.log("📤 Sending to Leads API:", leadPayload);

      await fetch(`${BASE_API_URL}/api/mmr/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });

      console.log("✅ Lead successfully pushed to MMR API");
    } catch (apiError) {
      console.error("❌ Failed to send lead to API:", apiError);
    }

    // Response back
    return res.status(200).json({
      success: true,
      message: "Lead processed successfully",
      entry_id,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
