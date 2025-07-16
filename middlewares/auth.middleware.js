const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Universal auth middleware — supports cookies OR Bearer header
const authMiddleware = (req, res, next) => {
  let token;

  // ✅ First, check Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // ✅ Fallback: check cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // You can attach any user info you store in the payload:
    req.user = {
      id: decoded.id,
      name: decoded.name,
      phone: decoded.phone,
     
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
