const express = require('express');

const {
  updateAssignHistory
} = require('../controllers/pushComments.controller');

const router = express.Router();

router.patch('/:id', updateAssignHistory);

module.exports = router;
