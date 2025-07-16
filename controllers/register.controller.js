const asyncHandler = require("../utils/asynchandler");

const User = require('../models/user.model');

const registerUser = asyncHandler(async(req , res) => {
     const { name, password, phone , role } = req.body;
  console.log(req.body)
  try {
    console.log("entered try-catch block");
    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    console.log("user is not existing")
    const user = new User({ name,  password, phone , role });
    await user.save();

    res.status(201).json({ message: 'User registered.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }

});

module.exports = registerUser;
