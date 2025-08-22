const express = require('express');

const {
  createAssignment,
  getAllAssignments,
  getAssignmentsByAssignee,
  getAssignmentHistoryById
} = require('../controllers/assign.controller');

const router = express.Router();

// ➜ POST /api/assign
router.post('/assign', createAssignment);

// ➜ GET /api/all/assigns
router.get('/all/assigns', getAllAssignments);

// ➜ GET /api/assigns/:assignee_id
router.get('/assigns/:assignee_id', getAssignmentsByAssignee);

// get assign history
router.get('/assigns/history/:id', getAssignmentHistoryById);

module.exports = router;
