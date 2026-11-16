const User = require('../models/User');
const { isMongo, getStore, saveLocalStore } = require('../config/db');

/**
 * @desc    Authorize a healthcare provider
 * @route   POST /api/providers/authorize
 * @access  Private/Admin
 */
async function authorizeProvider(req, res) {
  try {
    const { providerId, walletAddress } = req.body;

    if (isMongo()) {
      let user;
      if (providerId) {
        user = await User.findById(providerId);
      } else if (walletAddress) {
        user = await User.findOne({ walletAddress });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'Healthcare provider account not found' });
      }

      user.isAuthorizedOnChain = true;
      if (walletAddress) user.walletAddress = walletAddress;
      await user.save();

      return res.json({
        success: true,
        message: `Provider ${user.name} (${user.walletAddress}) authorized successfully`,
        provider: user
      });
    } else {
      const store = getStore();
      const user = store.users.find(
        (u) =>
          u._id === providerId ||
          u.id === providerId ||
          (walletAddress && u.walletAddress && u.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'Healthcare provider account not found' });
      }

      user.isAuthorizedOnChain = true;
      if (walletAddress) user.walletAddress = walletAddress;
      saveLocalStore();

      return res.json({
        success: true,
        message: `Provider ${user.name} (${user.walletAddress}) authorized successfully`,
        provider: user
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Revoke a healthcare provider
 * @route   POST /api/providers/revoke
 * @access  Private/Admin
 */
async function revokeProvider(req, res) {
  try {
    const { providerId, walletAddress } = req.body;

    if (isMongo()) {
      let user;
      if (providerId) {
        user = await User.findById(providerId);
      } else if (walletAddress) {
        user = await User.findOne({ walletAddress });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'Healthcare provider not found' });
      }

      user.isAuthorizedOnChain = false;
      await user.save();

      return res.json({
        success: true,
        message: `Provider ${user.name} authorization revoked`,
        provider: user
      });
    } else {
      const store = getStore();
      const user = store.users.find(
        (u) =>
          u._id === providerId ||
          u.id === providerId ||
          (walletAddress && u.walletAddress && u.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'Healthcare provider not found' });
      }

      user.isAuthorizedOnChain = false;
      saveLocalStore();

      return res.json({
        success: true,
        message: `Provider ${user.name} authorization revoked`,
        provider: user
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Get all providers
 * @route   GET /api/providers
 * @access  Public / Authenticated
 */
async function getProviders(req, res) {
  try {
    if (isMongo()) {
      const providers = await User.find({ role: 'provider' }).select('-password');
      return res.json({ success: true, count: providers.length, providers });
    } else {
      const store = getStore();
      const providers = store.users
        .filter((u) => u.role === 'provider')
        .map(({ password, ...p }) => p);
      return res.json({ success: true, count: providers.length, providers });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  authorizeProvider,
  revokeProvider,
  getProviders
};
