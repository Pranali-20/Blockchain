const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
  uploadRecordFile,
  calculateHash,
  registerRecord,
  getAllRecords,
  getRecordById,
  verifyRecord,
  getVerificationHistory,
  downloadRecord
} = require('../controllers/recordController');

// Upload file & get SHA-256 hash
router.post('/upload', protect, authorize('provider', 'admin'), upload.single('file'), uploadRecordFile);

// Utility to calculate hash from text/file
router.post('/hash', upload.single('file'), calculateHash);

// Register record metadata (after provider signs or off-chain registers)
router.post('/register', protect, authorize('provider', 'admin'), registerRecord);

// Get all records for user
router.get('/', protect, getAllRecords);

// Verification audit history
router.get('/verification-history', protect, getVerificationHistory);

// Download off-chain file
router.get('/download/:recordId', downloadRecord);

// Get single record details
router.get('/:recordId', protect, getRecordById);

// Verify record integrity (Public/Patient verification)
router.post('/verify', upload.single('file'), verifyRecord);

module.exports = router;
