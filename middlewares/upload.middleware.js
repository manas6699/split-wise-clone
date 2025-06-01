const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// === Storage Configuration ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // All files go into /uploads
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

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

// === Multer Instances ===
const uploadImage = multer({
  storage,
  fileFilter: fileFilters.image,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadPdf = multer({
  storage,
  fileFilter: fileFilters.pdf,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// For endpoints that upload both image and PDF in one request
const uploadMixed = multer({
  storage,
  fileFilter: fileFilters.mixed,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = {
  uploadImage,
  uploadPdf,
  uploadMixed,
};
