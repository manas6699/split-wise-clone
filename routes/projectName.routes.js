const express = require("express");
const router = express.Router();
const { createProject , getAllProjects } = require("../controllers/projectName.controller");

// POST -> /api/projects
router.post("/projectName", createProject);
// GET
router.get("/projectName" , getAllProjects);

module.exports = router;
