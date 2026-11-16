const jwt = require('jsonwebtoken');
const { isMongo, getStore } = require('../config/db');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'medical_blockchain_secret_key_2026';

// Protect routes
async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (No token provided)'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongo()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      const store = getStore();
      const user = store.users.find((u) => u._id === decoded.id || u.id === decoded.id);
      if (user) {
        const { password, ...userWithoutPass } = user;
        req.user = userWithoutPass;
      }
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
}

// Grant access to specific roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route`
      });
    }
    next();
  };
}

module.exports = {
  protect,
  authorize,
  JWT_SECRET
};
