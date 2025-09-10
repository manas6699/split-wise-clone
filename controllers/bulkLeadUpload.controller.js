// controllers/leadController.js
const Papa = require("papaparse");
const fs = require("fs");
const Lead = require("../models/lead.model");

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
      name: row.name?.trim(),
      email: row.email,
      phone: row.phone,
      source: row.source,
      projectSource: row.projectSource,
      schedule_date: null,
      schedule_time: "",
      status: "not-assigned"
      // excluded: schedule_date, schedule_time, status, createdAt, updatedAt
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
