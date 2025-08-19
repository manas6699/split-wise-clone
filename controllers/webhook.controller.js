const Lead = require('../models/lead.model');
const axios = require('axios');

require('dotenv').config();

// Facebook Page Access Token (store in .env)
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Webhook verification
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified!');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
};

// Handle incoming leads
exports.handleWebhook = async (req, res) => {
  try {
    console.log('📩 Webhook Payload:', JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const leadgenId = change?.value?.leadgen_id;

    if (!leadgenId) {
      console.log("⚠️ No leadgen_id found in payload");
      return res.sendStatus(200);
    }

    // Step 1: Fetch lead details from Graph API
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${leadgenId}?access_token=${PAGE_ACCESS_TOKEN}`
    );

    const leadData = response.data;
    console.log("✅ Lead Data from Graph API:", leadData);

    // Step 2: Extract fields
    let extracted = {};
    leadData.field_data.forEach(field => {
      extracted[field.name] = field.values[0];
    });

    // Step 3: Save to MongoDB
    const newLead = new Lead({
      name: extracted.full_name || extracted.name || "Unknown",
      email: extracted.email,
      phone: extracted.phone_number,
      source: "Meta",
      comments: extracted.message || "",
    });

    await newLead.save();
    console.log("🎯 Lead saved to DB:", newLead);

    res.status(200).json({ success: true, lead: newLead });
  } catch (error) {
    console.error("❌ Error fetching/saving lead:", error.response?.data || error.message);
    res.sendStatus(500);
  }
};
