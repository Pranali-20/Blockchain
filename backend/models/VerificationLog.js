const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    index: true
  },
  verifierId: {
    type: String,
    default: 'anonymous'
  },
  verifierRole: {
    type: String,
    enum: ['patient', 'provider', 'admin', 'guest'],
    default: 'patient'
  },
  calculatedHash: {
    type: String,
    required: true
  },
  blockchainHash: {
    type: String,
    required: true
  },
  isValid: {
    type: Boolean,
    required: true
  },
  fileNameChecked: {
    type: String,
    default: 'uploaded_document'
  },
  verificationType: {
    type: String,
    enum: ['file_upload', 'direct_hash', 'tamper_demo'],
    default: 'file_upload'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
