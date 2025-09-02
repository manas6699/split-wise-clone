const express = require("express");
const router = express.Router();
const { createLocation, getAllLocations } = require("../controllers/location.controller");

// POST -> /api/locations
router.post("/name", createLocation);

// GET -> /api/locations
router.get("/name", getAllLocations);

module.exports = router;
