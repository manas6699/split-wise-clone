const asyncHandler = require("../utils/asynchandler");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  // Validate input
  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(403).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: 'Invalid credentials' });
    }


    // Generate a JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return token in response
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    
    res.status(200).json({ message: 'Logged in successfully' });
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = loginUser;
