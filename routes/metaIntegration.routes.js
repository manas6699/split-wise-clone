const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
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

    // ✅ Capture Source Info
    const sourceInfo = {
      "x-source-domain": req.headers["x-source-domain"] || "not provided",
      "x-forwarded-by": req.headers["x-forwarded-by"] || "not provided",
      "referer": req.headers["referer"] || "not provided",
      "origin": req.headers["origin"] || "not provided",
      "user-agent": req.headers["user-agent"] || "unknown",
      "ip":
        req.headers["x-forwarded-for"]?.split(",")[0] || // if behind a proxy
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "unknown",
    };

    console.log("🌐 Source Info:", sourceInfo);

    // ✅ Store payload + metadata in MongoDB
    const newEntry = new SheetData({
      ...req.body,
      _sourceMeta: sourceInfo,
    });
    await newEntry.save();
    console.log("✅ Data + source info stored successfully in MongoDB");

    // ✅ Forward same data (with source info) to n8n Webhook
    try {
      const cleanData = JSON.parse(JSON.stringify(req.body));

      const n8nResponse = await fetch("https://n8n.mmrrealty.co.in/webhook/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Source-Domain": sourceInfo["x-source-domain"],
          "X-Forwarded-By": sourceInfo["x-forwarded-by"],
          "X-Client-IP": sourceInfo["ip"],
        },
        body: JSON.stringify({
          data: cleanData,
          source: sourceInfo, // optional - helps debug inside n8n
        }),
      });

      if (!n8nResponse.ok) {
        console.error("⚠️ Failed to forward data to n8n:", n8nResponse.statusText);
      } else {
        console.log("📤 Data successfully forwarded to n8n");
      }
    } catch (n8nError) {
      console.error("❌ Error forwarding to n8n:", n8nError);
    }

    // ✅ Respond to source service
    res.status(200).json({ success: true, message: "Data stored and sent to n8n" });

  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
