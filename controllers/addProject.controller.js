// controllers/projectController.js
const Project = require('../models/project.model');


exports.createProject = async (req, res) => {
  console.log('This is the entry point for testing')
  console.log(req.files)
  try {
    const parseIfString = (value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    // Extract file names from req.files
    const backgroundImage = req.files['backgroundImage']?.[0]?.location || '';
    const developerLogo = req.files['developerLogo']?.[0]?.location || '';
    const galleryImages = req.files['galleryImages']?.map(file => file.location) || [];
    const floorPlanImages = req.files['floorPlanImages']?.map(file => file.location) || [];
    const floorPlanPdf = req.files['floorPlanPdf']?.[0]?.location || '';
    const brochurePdf = req.files['brochurePdf']?.[0]?.location || '';

    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      priceRange: req.body.priceRange,
      backgroundImage,
      configuration: req.body.configuration,
      possessionDate: req.body.possessionDate,
      unitsSold: req.body.unitsSold,
      landArea: req.body.landArea,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      noOfBlocks: req.body.noOfBlocks,
      floors: req.body.floors,
      noOfUnits: req.body.noOfUnits,
      reraId: req.body.reraId,
      iframeSource: req.body.iframeSource,
      features: parseIfString(req.body.features),
      developerLogo,
      developerDescription: req.body.developerDescription,
      projectOverview: req.body.projectOverview,
      paymentPlan: parseIfString(req.body.paymentPlan),
      highlights: parseIfString(req.body.highlights),
      galleryImages,
      floorPlanImages,
      floorPlanPdf,
      brochurePdf,
      unitsSoldPercentage: req.body.unitsSoldPercentage,
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project', error });
  }
};


// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects', error });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Failed to fetch project', error });
  }
};

// Update a project by ID
exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          priceRange: req.body.priceRange,
          backgroundImage: req.body.backgroundImage,
          configuration: req.body.configuration,
          possessionDate: req.body.possessionDate,
          unitsSold: req.body.unitsSold,
          landArea: req.body.landArea,
          propertyType: req.body.propertyType,
          propertySize: req.body.propertySize,
          noOfBlocks: req.body.noOfBlocks,
          floors: req.body.floors,
          noOfUnits: req.body.noOfUnits,
          reraId: req.body.reraId,
          iframeSource: req.body.iframeSource,
          features: req.body.features,
          developerLogo: req.body.developerLogo,
          developerDescription: req.body.developerDescription,
          projectOverview: req.body.projectOverview,
          paymentPlan: req.body.paymentPlan,
          highlights: req.body.highlights,
          galleryImages: req.body.galleryImages,
          floorPlanImages: req.body.floorPlanImages,
          // NEW FIELDS
          floorPlanPdf: req.body.floorPlanPdf,
          brochurePdf: req.body.brochurePdf,
          unitsSoldPercentage: req.body.unitsSoldPercentage,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project', error });
  }
};

// Delete a project by ID
exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project', error });
  }
};
