const express = require('express');
const router = express.Router();
const { authorizeProvider, revokeProvider, getProviders } = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProviders);
router.post('/authorize', protect, authorize('admin'), authorizeProvider);
router.post('/revoke', protect, authorize('admin'), revokeProvider);

module.exports = router;
