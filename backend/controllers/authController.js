const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isMongo, getStore, saveLocalStore } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(id, role) {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d'
  });
}

/**
 * @desc    Register a new user (Admin, Healthcare Provider, Patient)
 * @route   POST /api/auth/register
 * @access  Public
 */
async function register(req, res) {
  try {
    const { name, email, password, role, walletAddress, hospitalName, licenseNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const assignedRole = ['admin', 'provider', 'patient'].includes(role) ? role : 'patient';

    if (isMongo()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        walletAddress: walletAddress || '',
        hospitalName: hospitalName || '',
        licenseNumber: licenseNumber || '',
        isAuthorizedOnChain: assignedRole === 'admin'
      });

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          hospitalName: user.hospitalName,
          licenseNumber: user.licenseNumber,
          isAuthorizedOnChain: user.isAuthorizedOnChain
        }
      });
    } else {
      // JSON Store Fallback
      const store = getStore();
      const userExists = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newId = 'usr_' + Date.now();

      const newUser = {
        _id: newId,
        id: newId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: assignedRole,
        walletAddress: walletAddress || '',
        hospitalName: hospitalName || '',
        licenseNumber: licenseNumber || '',
        isAuthorizedOnChain: assignedRole === 'admin',
        createdAt: new Date()
      };

      store.users.push(newUser);
      saveLocalStore();

      const token = generateToken(newUser.id, newUser.role);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          walletAddress: newUser.walletAddress,
          hospitalName: newUser.hospitalName,
          licenseNumber: newUser.licenseNumber,
          isAuthorizedOnChain: newUser.isAuthorizedOnChain
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (isMongo()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id, user.role);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          hospitalName: user.hospitalName,
          licenseNumber: user.licenseNumber,
          isAuthorizedOnChain: user.isAuthorizedOnChain
        }
      });
    } else {
      const store = getStore();
      const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user.id, user.role);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          hospitalName: user.hospitalName,
          licenseNumber: user.licenseNumber,
          isAuthorizedOnChain: user.isAuthorizedOnChain
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
async function getAllUsers(req, res) {
  try {
    if (isMongo()) {
      const users = await User.find().select('-password');
      return res.json({ success: true, count: users.length, users });
    } else {
      const store = getStore();
      const sanitized = store.users.map(({ password, ...u }) => u);
      return res.json({ success: true, count: sanitized.length, users: sanitized });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getAllUsers
};
