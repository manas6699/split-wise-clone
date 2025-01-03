const asyncHandler = require("../utils/asynchandler");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model')
require('dotenv').config();

const loginUser = asyncHandler(async(req , res) => {
    const { phone, password } = req.body;
    
  try {
    const user = await User.findOne({ phone });
    console.log("phone number found!")
    if (!user) return res.status(400).json({ message: 'User not found' });

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

   

    const token = jwt.sign({ id: user._id, name: user.name , phone: user.phone}, process.env.JWT_SECRET, { expiresIn: '1h' });

    
    // Set token in headers
    res.set('Authorization', `Bearer ${token}`);

    res.status(200).json({ token, message: 'Logged in successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
})

module.exports = loginUser