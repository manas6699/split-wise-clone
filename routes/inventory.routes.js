const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties
} = require('../controllers/inventory.controller');

// Rate limiting configuration would be added here in a real application

// @route   POST /api/properties
// @desc    Create a new property listing
router.post('/', createProperty);

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
router.get('/', getProperties);

// @route   GET /api/properties/search
// @desc    Search properties by location or complex name
router.get('/search', searchProperties);

// @route   GET /api/properties/:id
// @desc    Get single property by ID
router.get('/:id', getPropertyById);

// @route   PUT /api/properties/:id
// @desc    Update property by ID
router.put('/:id', updateProperty);

// @route   DELETE /api/properties/:id
// @desc    Delete property by ID (soft delete)
router.delete('/:id', deleteProperty);

module.exports = router;