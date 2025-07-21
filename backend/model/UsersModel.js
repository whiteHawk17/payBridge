const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // Google user ID
  email: { type: String, required: true, unique: true },
  name: { type: String },
  photo: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  suspended: { type: Boolean, default: false },
  // ... add any other fields as needed
});

module.exports = mongoose.model('User', UserSchema);