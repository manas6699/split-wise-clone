const express = require('express');
const router = express.Router();

const {
  createProject,
  getProjectById,
  updateProject
} = require('../controllers/addProject.controller');

const { uploadProjectAssets, uploadMixed } = require('../middlewares/upload.middleware');

// ✅ Route to create a new project with file uploads
router.post('/create', uploadMixed.any(), (req, res) => {
  console.log('Received file fieldnames:', req.files.map(f => f.fieldname));
  return res.send('Check console');
});

// ✅ Get project by ID
router.get('/:id', getProjectById);

// ✅ Update a project by ID using same upload middleware
router.put('/:id', uploadProjectAssets, updateProject);


module.exports = router;
