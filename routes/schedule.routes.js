const mongoose = require('mongoose');
const router = require('express').Router();

const scheduleController = require('../controllers/schedule.controller');

router.get('/allSchedules', scheduleController.getAllSchedules);
router.get('/schedules/:assigneeId', scheduleController.getSchedulesByAssignee);
router.get('/schedules/assignid/:assigneeId', scheduleController.getAssignIdsfromSchedule);
router.get('/schedules/fullData/:assigneeId', scheduleController.getFullAssignDataFromSchedule);


module.exports = router;
