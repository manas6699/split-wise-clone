const express = require('express');

const {
  createAssignment,
  getAllAssignments,
  getAssignmentsByAssignee,
} = require('../controllers/assign.controller');

const router = express.Router();

// ➜ POST /api/assign
router.post('/assign', createAssignment);

// ➜ GET /api/all/assigns
router.get('/all/assigns', getAllAssignments);

// ➜ GET /api/assigns/:assignee_id
router.get('/assigns/:assignee_id', getAssignmentsByAssignee);

module.exports = router;
