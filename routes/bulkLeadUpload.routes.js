// routes/leadRoutes.js
const express = require("express");
const multer = require("multer");
const { bulkUploadLeads , bulkUploadAndAssignLeads } = require("../controllers/bulkLeadUpload.controller");

const router = express.Router();

// Multer setup (store uploaded file in /tmp)
const upload = multer({ dest: "tmp/csv/" });

// Bulk upload route
router.post("/bulk", upload.single("file"), bulkUploadLeads);

// bulk upload + assign leads
router.post(
  "/bulk-upload-assign",
  upload.single("file"),
  bulkUploadAndAssignLeads
);

module.exports = router;
