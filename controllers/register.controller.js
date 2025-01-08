const asyncHandler = require("../utils/asynchandler");
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const registerUser = asyncHandler(async(req , res) => {
     const { name, password, phone } = req.body;
  console.log(req.body)
    console.log("entering before try-catch block" , password);
  try {
    console.log("entered try-catch block");
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ name }, { phone }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    console.log("user is not existing")
    // Hash password
    console.log("Before hashing" , password);
    // const hashedPassword = await bcrypt.hash(password, 10);
    // console.log("Password is hashed");
    // Save user
    const user = new User({ name,  password, phone });
    await user.save();

    res.status(201).json({ message: 'User registered.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }

});

module.exports = registerUser;