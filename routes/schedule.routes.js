const mongoose = require('mongoose');
const router = require('express').Router();

const scheduleController = require('../controllers/schedule.controller');

router.get('/allSchedules', scheduleController.getAllSchedules);
router.get('/schedules/:assigneeId', scheduleController.getSchedulesByAssignee);


module.exports = router;
