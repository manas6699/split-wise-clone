const logoutHandler = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'Token is required for logout.' });
  }

  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,       // if it was set as httpOnly
    secure: true,         // if using HTTPS
    sameSite: 'Lax',      // match how it was set
    path: '/',            // match the cookie's path
  });

  return res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = logoutHandler;
