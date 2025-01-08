const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware for authenticating JWT tokens
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  // Check if the Authorization header is present
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user data (decoded payload) to the request object
    req.user = { id: decoded.id, name: decoded.name, phone: decoded.phone };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
