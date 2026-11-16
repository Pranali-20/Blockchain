const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'provider', 'patient'],
    default: 'patient'
  },
  walletAddress: {
    type: String,
    trim: true,
    default: ''
  },
  hospitalName: {
    type: String,
    trim: true,
    default: ''
  },
  licenseNumber: {
    type: String,
    trim: true,
    default: ''
  },
  isAuthorizedOnChain: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
