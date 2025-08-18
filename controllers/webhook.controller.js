// controllers/webhookController.js

// ✅ Step 1: Verification (Meta calls this first)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = '12345'; // keep in .env

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified!');
      return res.status(200).send(challenge); // send back the challenge
    } else {
      return res.sendStatus(403);
    }
  }
};

// ✅ Step 2: Handle lead notifications
exports.handleWebhook = (req, res) => {
  try {
    console.log("📩 Webhook event received:", JSON.stringify(req.body, null, 2));

    // Meta sends lead info in req.body.entry
    const entries = req.body.entry || [];

    entries.forEach(entry => {
      const changes = entry.changes || [];
      changes.forEach(change => {
        if (change.field === 'leadgen') {
          const leadgenData = change.value;
          console.log("📌 Lead received:", leadgenData);

          // Example: Save to DB
          // Lead.create({
          //   lead_id: leadgenData.leadgen_id,
          //   form_id: leadgenData.form_id,
          //   created_time: leadgenData.created_time,
          //   page_id: leadgenData.page_id
          // });

        }
      });
    });

    res.sendStatus(200); // Acknowledge receipt
  } catch (error) {
    console.error("❌ Error in webhook:", error);
    res.sendStatus(500);
  }
};
