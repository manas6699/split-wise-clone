const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const addGroupHandler = require('../controllers/addGroup.controller');
const allGroupHandler = require('../controllers/allGroup.controller');
const editGroupHandler = require('../controllers/groupEdit.controller');
const getMembersinaGroup = require('../controllers/getAllMembers.controller');

// Create a new group
// the user who created the group is automatically added in members position
router.route('/add').post(authMiddleware, addGroupHandler);


// all groups of an user
router.route('/allusers').get(authMiddleware, allGroupHandler);

// All members added in a group
router.route('/allmembers/:group_id').get(authMiddleware,getMembersinaGroup);

router.route('/edit/:group_id').put(authMiddleware , editGroupHandler);

  
module.exports = router;
