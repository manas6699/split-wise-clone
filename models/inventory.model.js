const mongoose = require('mongoose');

// Amenities Sub-schema
const amenitiesSchema = new mongoose.Schema({
  clubhouse: { type: Boolean, default: false },
  swimmingPool: { type: Boolean, default: false },
  gym: { type: Boolean, default: false },
  communityHall: { type: Boolean, default: false },
  badmintonCourt: { type: Boolean, default: false },
  cafeteria: { type: Boolean, default: false },
  gasPipeline: { type: Boolean, default: false }
});

// Owner Details Sub-schema
const ownerSchema = new mongoose.Schema({
  ownerName: { type: String, required: true, trim: true },
  ownerPhone: { type: String, required: true, trim: true },
  ownerAltPhone: { type: String, trim: true, default: '' },
  ownerEmail: { type: String, trim: true, lowercase: true },
  ownerType: { 
    type: String, 
    enum: ['owner', 'broker', 'caretaker'], 
    default: 'owner' 
  },
  ownerNotes: { type: String, trim: true, default: '' }
});

// Main Property Schema
const propertySchema = new mongoose.Schema({
  // Owner Details
  ownerDetails: { type: ownerSchema, required: true },
  
  // Basic Information
  listingType: { 
    type: String, 
    enum: ['rent', 'sale'], 
    required: true 
  },
  propertyType: { 
    type: String, 
    enum: ['complex', 'standalone', 'individual'], 
    required: true 
  },
  complexName: { type: String, trim: true, default: '' },
  
  // Location & Pricing
  location: { type: String, required: true, trim: true },
  nearbyLandmarks: { type: String, trim: true, default: '' },
  price: { type: Number, min: 0 },
  rent: { type: Number, min: 0 },
  securityDeposit: { type: Number, min: 0 },
  maintenanceIncluded: { type: Boolean, default: false },
  
  // Property Details
  configuration: { 
    type: String, 
    enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Studio'],
    required: true 
  },
  furnishing: { 
    type: String, 
    enum: ['unfurnished', 'semifurnished', 'furnished'], 
    required: true 
  },
  superBuiltUpArea: { type: Number, min: 0 },
  carpetArea: { type: Number, min: 0 },
  bedrooms: { type: Number, min: 0, default: 0 },
  bathrooms: { type: Number, min: 0, default: 0 },
  balconies: { type: Number, min: 0, default: 0 },
  totalFloors: { type: Number, min: 0 },
  propertyOnFloor: { type: Number, min: 0 },
  view: { type: String, trim: true, default: '' },
  parking: { 
    type: String, 
    enum: ['none', 'bike', '1car', '2car'], 
    default: 'none' 
  },
  vastuCompliant: { type: Boolean, default: false },
  liftAvailable: { type: Boolean, default: false },
  
  // Amenities
  amenities: { type: amenitiesSchema, default: () => ({}) },
  
  // Metadata
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'sold', 'rented'], 
    default: 'active' 
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  lastContacted: { type: Date }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
propertySchema.index({ location: 'text', complexName: 'text' });
propertySchema.index({ 'ownerDetails.ownerPhone': 1 });
propertySchema.index({ listingType: 1, propertyType: 1 });
propertySchema.index({ price: 1, rent: 1 });
propertySchema.index({ status: 1 });


// Method to update last contacted date
propertySchema.methods.updateLastContacted = function() {
  this.lastContacted = new Date();
  return this.save();
};

// Static method to find active properties
propertySchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find by owner phone
propertySchema.statics.findByOwnerPhone = function(phone) {
  return this.find({ 'ownerDetails.ownerPhone': phone });
};

module.exports = mongoose.model('Property', propertySchema);