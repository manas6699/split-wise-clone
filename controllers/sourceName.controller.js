const SourceName = require("../models/sourceName.model");

// ✅ Create new source name
exports.createSourceName = async (req, res) => {
  try {
    const { sourceName } = req.body;

    if (!sourceName) {
      return res.status(400).json({ message: "Source name is required" });
    }

    const newSource = new SourceName({ sourceName });
    await newSource.save();

    res.status(201).json({
      success: true,
      message: "Source name created successfully",
      data: newSource,
    });
  } catch (error) {
    console.error("Error creating source name:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Get all source names
exports.getSourceNames = async (req, res) => {
  try {
    const sources = await SourceName.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: sources,
    });
  } catch (error) {
    console.error("Error fetching sources:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
