const express = require('express');
const router = express.Router();
const path = require('path');
const { createProject , getProjectById, updateProject} = require('../controllers/addProject.controller');

const { uploadProjectAssets  } = require('../middlewares/upload.middleware');


router.post('/projects', uploadProjectAssets, projectController.createProject);

console.log('All files created successfully');

router.get('/:id', getProjectById);


router.put('/:id', uploadMixed.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'developerLogo', maxCount: 1 },
    { name: 'galleryImages', maxCount: 8 },
    { name: 'floorPlanImages', maxCount: 8 },
    { name: 'floorPlanPdf', maxCount: 1 },
    { name: 'brochurePdf', maxCount: 1 }
]), updateProject);

module.exports = router;
