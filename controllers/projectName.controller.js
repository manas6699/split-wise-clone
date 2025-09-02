const ProjectName = require("../models/projectName.model");

// @desc Add a new project
// @route POST /api/projects
// @access Public (change if using auth)
exports.createProject = async (req, res) => {
  try {
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const project = new ProjectName({ projectName });
    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// @desc Get all projects
// @route GET /api/projects
// @access Public (change if using auth)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectName.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
