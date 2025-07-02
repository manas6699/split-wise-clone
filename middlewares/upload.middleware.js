const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const s3 = require('../utils/s3client'); // import the S3 client



// === File Filters ===
const fileFilters = {
  image: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const extMatch = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeMatch = allowed.test(file.mimetype);
    if (extMatch && mimeMatch) cb(null, true);
    else cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'));
  },
  pdf: (req, file, cb) => {
    const isPDF = path.extname(file.originalname).toLowerCase() === '.pdf' &&
                  file.mimetype === 'application/pdf';
    if (isPDF) cb(null, true);
    else cb(new Error('Only PDF files are allowed!'));
  },
  mixed: (req, file, cb) => {
    const isImage = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
    const isPDF = file.mimetype === 'application/pdf';
    if (isImage || isPDF) cb(null, true);
    else cb(new Error('Only image and PDF files are allowed!'));
  },
};

// === S3 Storage ===
const s3Storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

// === Multer Instances ===
const uploadImage = multer({
  storage: s3Storage,
  fileFilter: fileFilters.image,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadPdf = multer({
  storage: s3Storage,
  fileFilter: fileFilters.pdf,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadMixed = multer({
  storage: s3Storage,
  fileFilter: fileFilters.mixed,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = {
  uploadImage,
  uploadPdf,
  uploadMixed,
};
