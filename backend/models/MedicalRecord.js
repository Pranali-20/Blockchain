const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileMimeType: {
    type: String,
    default: 'application/pdf'
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  sha256Hash: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientName: {
    type: String,
    default: 'Patient'
  },
  patientEmail: {
    type: String,
    default: ''
  },
  providerId: {
    type: String,
    required: true,
    index: true
  },
  providerName: {
    type: String,
    default: ''
  },
  providerAddress: {
    type: String,
    required: true
  },
  documentReference: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    default: ''
  },
  blockNumber: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending_blockchain', 'registered_on_chain', 'tampered', 'archived'],
    default: 'registered_on_chain'
  },
  category: {
    type: String,
    enum: ['Lab Report', 'Prescription', 'Discharge Summary', 'Radiology/X-Ray', 'Clinical Note', 'Other'],
    default: 'Lab Report'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
