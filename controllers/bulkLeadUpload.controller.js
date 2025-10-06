// controllers/leadController.js
const Papa = require("papaparse");
const fs = require("fs");
const Lead = require("../models/lead.model");
const Assign = require("../models/assign.model");

// Bulk upload controller
exports.bulkUploadLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file is required" });
    }

    // Read CSV file
    const file = fs.readFileSync(req.file.path, "utf8");

    // Parse CSV → JSON
    const parsed = Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid CSV format",
        errors: parsed.errors,
      });
    }

    // Filter out unwanted fields
    const leads = parsed.data.map((row) => ({
      name: row["NAME"]?.trim() || "",
      email: row["EMAIL"] || "",
      phone: row["PHONE"] || "",
      source: row["PROJECT NAME"] || "",
      projectSource: row["LEAD SOURCE"] || "",
      schedule_date: null,
      schedule_time: "",
      status: "not-assigned"
    }));

    // Insert into MongoDB
    await Lead.insertMany(leads);

    // Cleanup tmp file
    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      message: "Bulk leads uploaded successfully",
      count: leads.length,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.bulkUploadAndAssignLeads = async (req, res) => {
  try {
    const { assignee_id, assignee_name , history } = req.body; // assignee info
    if (!assignee_id || !assignee_name) {
      return res.status(400).json({
        success: false,
        message: "assignee_id and assignee_name are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file is required" });
    }

    // Read CSV file
    const file = fs.readFileSync(req.file.path, "utf8");

    // Parse CSV → JSON
    const parsed = Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid CSV format",
        errors: parsed.errors,
      });
    }

    let successCount = 0;
    let failed = [];

    for (const row of parsed.data) {
      try {
        // Step 1 → Insert lead
        const lead = new Lead({
          name: row["NAME"]?.trim() || "",
          email: row["EMAIL"] || "",
          phone: row["PHONE"] || "",
          source: row["PROJECT NAME"] || "",
          projectSource: row["LEAD SOURCE"] || "",
          schedule_date: null,
          schedule_time: "",
          status: "not-assigned",
        });
        await lead.save();

        // Step 2 → Assign lead (reuse logic of createAssignment)
        const assign = new Assign({
          lead_id: lead._id,
          assignee_id,
          assignee_name,
          assign_mode: "Bulk",
          status: "assigned",
          remarks: "",
          history: history,
          lead_details: {
            name: lead.name || "",
            email: lead.email || "",
            phone: lead.phone || "",
            source: lead.source || "",
            projectSource: lead.projectSource || "",
            status: "assigned", // updated
            lead_type: "",
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
          },
        });
        await assign.save();

        // Step 3 → Update lead status
        lead.status = "assigned";
        await lead.save();

        successCount++;
      } catch (err) {
        console.error("❌ Lead insert/assign failed:", err.message);
        failed.push({ row, error: err.message });
      }
    }

    // Cleanup tmp file
    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      message: `Bulk upload completed. ${successCount} leads assigned to ${assignee_name}.`,
      total: parsed.data.length,
      successCount,
      failed,
    });
  } catch (error) {
    console.error("Bulk Upload & Assign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

