const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function() { return this.authType === 'local' },
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return this.authType === 'local' },
    select: false
  },
  displayName: {
    type: String,
    required: true
  },
  authType: {
    type: String,
    enum: ['local', 'github'],
    required: true
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);