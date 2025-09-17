const express = require('express');

const {
  createAssignment,
  bulkAssign,
  getAllAssignments,
  getMultipleAssigns,
  getAssignmentsByAssignee,
  getAssignmentHistoryById
} = require('../controllers/assign.controller');

const router = express.Router();

// ➜ POST /api/assign
router.post('/assign', createAssignment);

// Bulk assign route
router.post('/bulk/assign' ,bulkAssign );

// ➜ GET /api/all/assigns
router.get('/all/assigns', getAllAssignments);

// ➜ GET /api/assigns/:assignee_id
router.get('/assigns/:assignee_id', getAssignmentsByAssignee);

// get assign history
router.get('/assigns/history/:id', getAssignmentHistoryById);

// get multiple assigns
router.post('/getAll/assigns' , getMultipleAssigns);

module.exports = router;
