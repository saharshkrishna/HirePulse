const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profileType: {
    type: String,
    enum: ['student', 'fresher', 'experienced', null],
    default: null
  },
  isSetupCompleted: {
    type: Boolean,
    default: false
  },
  profileDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
