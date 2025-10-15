// controllers/historyCheckController.js
const AssignedLead = require("../models/assign.model"); // adjust path/model name


// for all the fucking transferred leads
exports.getLeadsWithMixedHistory = async (req, res) => {
  try {
    // 1. Fetch only the needed fields for efficiency
    const leads = await AssignedLead.find({}, { lead_id: 1, history: 1 });

    const resultLeadIds = [];

    leads.forEach((lead) => {
      const { history } = lead;

      if (!Array.isArray(history) || history.length < 3) return;

      // Example pattern:
      // index 0 => string
      // index 1..n => objects
      // last index => string
      const first = history[0];
      const last = history[history.length - 1];

      if (typeof first !== "string" || typeof last !== "string") return;

      // Everything in between must be objects
      const middle = history.slice(1, history.length - 1);

      if (
        middle.length > 0 &&
        middle.every((entry) => typeof entry === "object" && entry !== null)
      ) {
        resultLeadIds.push(lead.lead_id);
      }
    });

    res.status(200).json({
      success: true,
      count: resultLeadIds.length,
      lead_ids: resultLeadIds,
    });
  } catch (error) {
    console.error("Error scanning history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// only lead_id in response
exports.getReassignedByUser = async (req, res) => {
  try {
    const { username } = req.query; // e.g., "TC_Ayan Sarkar"

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required (e.g., ?username=TC_Ayan Sarkar)",
      });
    }

    // Fetch only lead_id & history for performance
    const leads = await AssignedLead.find({}, { lead_id: 1, history: 1 });

    const reassignedLeads = [];

    leads.forEach((lead) => {
      const { history, lead_id } = lead;

      if (!Array.isArray(history)) return;

      history.forEach((entry) => {
        if (typeof entry === "string" && entry.includes("has been reassigned")) {
          // Example match: "This Lead has been reassigned to X by Y ..."
          // Check if username is the one who transferred
          // Typically the format has " by <OLD_USER>"
          const parts = entry.split(" by ");
          if (parts.length > 1) {
            const afterBy = parts[1]; // e.g. "TC_Ayan Sarkar with remarks..."
            const namePart = afterBy.split(" with remarks")[0].trim();
            // namePart = "TC_Ayan Sarkar"

            if (namePart === username) {
              reassignedLeads.push(lead_id);
            }
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      count: reassignedLeads.length,
      lead_ids: reassignedLeads,
    });
  } catch (error) {
    console.error("Error fetching reassigned leads:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// total details in response
exports.getReassignedByUserWithDetails = async (req, res) => {
  try {
    const { username } = req.query; // e.g., ?username=TC_Ayan Sarkar

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required (e.g., ?username=TC_Ayan Sarkar)",
      });
    }

    // Fetch only needed fields first
    const leads = await AssignedLead.find({}, { lead_id: 1, history: 1 });

    const matchedLeadIds = [];

    leads.forEach((lead) => {
      const { history, lead_id } = lead;
      if (!Array.isArray(history)) return;

      history.forEach((entry) => {
        if (typeof entry === "string" && entry.includes("has been reassigned")) {
          // Find " by <username>"
          const parts = entry.split(" by ");
          if (parts.length > 1) {
            const afterBy = parts[1]; // "TC_X with remarks ...."
            const namePart = afterBy.split(" with remarks")[0].trim();
            if (namePart === username) {
              matchedLeadIds.push(lead_id);
            }
          }
        }
      });
    });

    // Now fetch the full docs for these lead ids
    const fullDetails = await AssignedLead.find(
      { lead_id: { $in: matchedLeadIds } },
      {}
    ).lean();

    res.status(200).json({
      success: true,
      count: fullDetails.length,
      data: fullDetails, // full documents
    });
  } catch (error) {
    console.error("Error fetching reassigned leads:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};