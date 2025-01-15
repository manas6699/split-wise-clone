// Init the express router
const router = require('express').Router();

const authMiddleware = require('../middlewares/auth.middleware');

const mongoose = require('mongoose')
const expensesandMembersDetailsHandler = require('../controllers/getAllMembers.controller')

router.get('/allUsers', authMiddleware, (req, res) => {
    // Fetch all users from the database
    // const User = mongoose.model('User');
    // User.find()
    //     .then(users => res.json(users))
    //     .catch(err => res.status(400).json('Error: ' + err));

    // put all the users names in an object
    const User = mongoose.model('User');
    User.find({}, 'name')
        .then(users => {
            let usersList = {};
            users.forEach(user => {
                usersList[user._id] = user.name;
            });
            res.json(usersList);
        })
        .catch(err => res.status(400).json('Error: ' + err));

});

router.route('/allMembersandExpenses',authMiddleware).get(expensesandMembersDetailsHandler);

module.exports = router;

