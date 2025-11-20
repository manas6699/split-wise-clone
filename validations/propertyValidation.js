const Joi = require('joi');

// Phone number validation for Indian numbers
const phoneRegex = /^[6-9]\d{9}$/;

// Owner Details Validation
const ownerValidation = Joi.object({
  ownerName: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Owner name is required',
      'string.min': 'Owner name must be at least 2 characters long',
      'string.max': 'Owner name cannot exceed 100 characters'
    }),
  ownerPhone: Joi.string().pattern(phoneRegex).required()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit Indian phone number'
    }),
  ownerAltPhone: Joi.string().pattern(phoneRegex).allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit Indian phone number'
    }),
  ownerEmail: Joi.string().email().allow(''),
  ownerType: Joi.string().valid('owner', 'broker', 'caretaker').default('owner'),
  ownerNotes: Joi.string().max(500).allow('')
});

// Amenities Validation
const amenitiesValidation = Joi.object({
  clubhouse: Joi.boolean().default(false),
  swimmingPool: Joi.boolean().default(false),
  gym: Joi.boolean().default(false),
  communityHall: Joi.boolean().default(false),
  badmintonCourt: Joi.boolean().default(false),
  cafeteria: Joi.boolean().default(false),
  gasPipeline: Joi.boolean().default(false)
});

// Main Property Validation Schema
const createPropertyValidation = Joi.object({
  // Owner Details
  ownerDetails: ownerValidation.required(),
  
  // Basic Information
  listingType: Joi.string().valid('rent', 'sale').required(),
  propertyType: Joi.string().valid('complex', 'standalone', 'individual').required(),
  complexName: Joi.when('propertyType', {
    is: 'complex',
    then: Joi.string().trim().min(1).required(),
    otherwise: Joi.string().trim().allow('')
  }),
  
  // Location & Pricing
  location: Joi.string().trim().min(5).max(500).required(),
  nearbyLandmarks: Joi.string().trim().max(200).allow(''),
  price: Joi.when('listingType', {
    is: 'sale',
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().min(0).allow(null)
  }),
  rent: Joi.when('listingType', {
    is: 'rent',
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().min(0).allow(null)
  }),
  securityDeposit: Joi.when('listingType', {
    is: 'rent',
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().min(0).allow(null)
  }),
  maintenanceIncluded: Joi.boolean().default(false),
  
  // Property Details
  configuration: Joi.string().valid('1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Studio').required(),
  furnishing: Joi.string().valid('unfurnished', 'semifurnished', 'furnished').required(),
  superBuiltUpArea: Joi.number().min(0).required(),
  carpetArea: Joi.number().min(0).required(),
  bedrooms: Joi.number().min(0).max(20).default(0),
  bathrooms: Joi.number().min(0).max(20).default(0),
  balconies: Joi.number().min(0).max(10).default(0),
  totalFloors: Joi.number().min(0).max(200),
  propertyOnFloor: Joi.number().min(0),
  view: Joi.string().trim().max(100).allow(''),
  parking: Joi.string().valid('none', 'bike', '1car', '2car').default('none'),
  vastuCompliant: Joi.boolean().default(false),
  liftAvailable: Joi.boolean().default(false),
  
  // Amenities
  amenities: amenitiesValidation.default()
});

// Update Property Validation (all fields optional)
const updatePropertyValidation = createPropertyValidation.fork(
  Object.keys(createPropertyValidation.describe().keys),
  (schema) => schema.optional()
);

// Query Validation for GET requests
const queryValidation = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  listingType: Joi.string().valid('rent', 'sale'),
  propertyType: Joi.string().valid('complex', 'standalone', 'individual'),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  minRent: Joi.number().min(0),
  maxRent: Joi.number().min(0),
  location: Joi.string().trim(),
  configuration: Joi.string().valid('1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Studio'),
  sortBy: Joi.string().valid('price', 'rent', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createPropertyValidation,
  updatePropertyValidation,
  queryValidation
};