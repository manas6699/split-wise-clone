const logoutHandler = async(req , res) => {
     const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'Token is required for logout.' });
  }

  res.status(200).json({ message: 'Logged out successfully.' });
}

module.exports = logoutHandler