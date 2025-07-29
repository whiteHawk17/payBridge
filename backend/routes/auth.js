const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const { signToken } = require('../utils/jwt');
const UsersModel = require('../model/UsersModel');
const { FRONTEND_BASE_URL } = require('../config/env');
const { verifyEmail } = require('../utils/emailService');

// Start Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// Email existence check for login flow
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ exists: false, message: 'Email required' });
  const user = await UsersModel.findOne({ email });
  res.json({ exists: !!user });
});

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  const { signToken } = require('../utils/jwt');
  const { FRONTEND_BASE_URL } = require('../config/env');
  const token = signToken(req.user);
  // Set JWT as HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
  // Redirect to dashboard
  res.redirect(`${FRONTEND_BASE_URL || 'https://paybridge.site'}/dashboard`);
});

// Authenticated user info endpoint
const jwtAuth = require('../middleware/jwtAuth');
// GET /auth/me - Get current user info
router.get('/me', jwtAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    photo: req.user.photo // Add photo field
  });
});

// GET /auth/token - Get current user's token (for testing)
router.get('/token', jwtAuth, (req, res) => {
  // Get token from cookie or header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  res.json({ token });
});

// Logout (for JWT, just clear token on frontend)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out' });
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ isValid: false, message: 'Email is required' });
    }
    
    const verificationResult = await verifyEmail(email);
    res.json(verificationResult);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ isValid: false, message: 'Email verification failed' });
  }
});

module.exports = router; 