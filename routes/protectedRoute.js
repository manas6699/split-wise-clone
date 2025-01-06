const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Example of a protected route
router.get('/secure', authMiddleware, (req, res) => {
  // Access user data attached by the middleware
  const user = req.user;

  // Return a secure response
  res.json({
    message: 'This is secure data only accessible to authenticated users.',
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone
    }
  });
});

module.exports = router;
