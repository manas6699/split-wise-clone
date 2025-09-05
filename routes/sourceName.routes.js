// routes/sourceNameRoutes.js
const express = require("express");
const router = express.Router();
const { createSourceName, getSourceNames } = require("../controllers/sourceName.controller");

router.post("/source", createSourceName); 
router.get("/source", getSourceNames);

module.exports = router;
