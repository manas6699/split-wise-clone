const Location = require("../models/locations.model");

// @desc Add a new location
// @route POST /api/locations
// @access Public (change if using auth)
exports.createLocation = async (req, res) => {
  try {
    const { locationName } = req.body;

    if (!locationName) {
      return res.status(400).json({ success: false, message: "Location name is required" });
    }

    // check for duplicate
    const existingLocation = await Location.findOne({ locationName });
    if (existingLocation) {
      return res.status(400).json({ success: false, message: "Location already exists" });
    }

    const location = new Location({ locationName });
    await location.save();

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get all locations
// @route GET /api/locations
// @access Public
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
