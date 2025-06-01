const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  featureIcon: [String], // list of Lucide icon names
  featureTitle: {
    type: String,
    required: true,
  },
  featureDescription: {
    type: String,
    required: true,
  },
});

const PaymentPlanSchema = new mongoose.Schema({
  unitType: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    priceRange: String,
    backgroundImage: {
      type: String,
      required: true,
    }, // file path or URL
    configuration: String,
    possessionDate: String,
    unitsSold: Number,
    landArea: String,
    propertyType: String,
    propertySize: String,
    noOfBlocks: Number,
    floors: Number,
    noOfUnits: Number,
    reraId: String,
    iframeSource: String,

    features: [FeatureSchema],

    developerLogo: String, // file path or URL
    developerDescription: String,

    projectOverview: String, // rich text (HTML)
    paymentPlan: [PaymentPlanSchema],
    highlights: String, // rich text (HTML)

    galleryImages: {
      type: [String], // array of file paths or URLs
      validate: {
        validator: function (val) {
          return val.length <= 8;
        },
        message: 'You can upload up to 8 gallery images.',
      },
    },
    floorPlanImages: {
      type: [String], // array of file paths or URLs
      validate: {
        validator: function (val) {
          return val.length <= 8;
        },
        message: 'You can upload up to 8 floor plan images.',
      },
    },

    // 🔽 NEW FIELDS ADDED HERE
    floorPlanPdf: {
      type: String,
    },
    brochurePdf: {
      type: String, 
    },
    unitsSoldPercentage: {
      type: String, // e.g., "70%" as a string
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', ProjectSchema);
