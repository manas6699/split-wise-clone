const express = require("express");
const { getOldLeads , getLeadsByUser , createOldAssigntoNew , buildLeadWithDisposition } = require("../controllers/enquiry.controller");

const router = express.Router();

// GET /api/ol
router.get("/oL", getOldLeads);

router.get("/telecaller" , getLeadsByUser);
router.post("/assign/old/to/telecaller" , createOldAssigntoNew);

// legacy endpoint alart!!!!!!!!! Don't touch it!!
// {{baseURL}}/api/admin/disposition
// router.get("/disposition" , buildLeadWithDisposition)

module.exports = router;
