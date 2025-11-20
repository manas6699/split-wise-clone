const Property = require('../models/inventory.model');
const { createPropertyValidation, updatePropertyValidation, queryValidation } = require('../validations/propertyValidation');

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Public
const createProperty = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createPropertyValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if property with same owner phone already exists (optional)
    const existingProperty = await Property.findOne({ 
      'ownerDetails.ownerPhone': value.ownerDetails.ownerPhone,
      status: 'active'
    });

    if (existingProperty) {
      return res.status(409).json({
        success: false,
        message: 'A property with this phone number already exists',
        data: { existingId: existingProperty._id }
      });
    }

    // Create new property
    const property = new Property(value);
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });

  } catch (error) {
    console.error('Create Property Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all properties with filtering and pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = queryValidation.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      page,
      limit,
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      minRent,
      maxRent,
      location,
      configuration,
      sortBy,
      sortOrder
    } = value;

    // Build filter object
    const filter = { status: 'active' };
    
    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (configuration) filter.configuration = configuration;
    
    // Price/Rent filtering
    if (listingType === 'sale') {
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = minPrice;
        if (maxPrice) filter.price.$lte = maxPrice;
      }
    } else if (listingType === 'rent') {
      if (minRent || maxRent) {
        filter.rent = {};
        if (minRent) filter.rent.$gte = minRent;
        if (maxRent) filter.rent.$lte = maxRent;
      }
    }
    
    // Location search (case-insensitive)
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const properties = await Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Increment views for each property
    await Property.updateMany(
      { _id: { $in: properties.map(p => p._id) } },
      { $inc: { views: 1 } }
    );

    res.json({
      success: true,
      message: 'Properties retrieved successfully',
      data: {
        properties,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalRecords: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get Properties Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json({
      success: true,
      message: 'Property retrieved successfully',
      data: property
    });

  } catch (error) {
    console.error('Get Property Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update property by ID
// @route   PUT /api/properties/:id
// @access  Public
const updateProperty = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = updatePropertyValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });

  } catch (error) {
    console.error('Update Property Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete property by ID (soft delete)
// @route   DELETE /api/properties/:id
// @access  Public
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
      data: { id: property._id }
    });

  } catch (error) {
    console.error('Delete Property Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search properties by location or complex name
// @route   GET /api/properties/search
// @access  Public
const searchProperties = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const properties = await Property.find({
      status: 'active',
      $or: [
        { location: { $regex: q, $options: 'i' } },
        { complexName: { $regex: q, $options: 'i' } },
        { 'nearbyLandmarks': { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: properties
    });

  } catch (error) {
    console.error('Search Properties Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties
};