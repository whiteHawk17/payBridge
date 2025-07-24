const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const { signToken } = require('../utils/jwt');
const UsersModel = require('../model/UsersModel');
const { FRONTEND_BASE_URL } = require('../config/env');

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
  res.redirect(`${FRONTEND_BASE_URL || 'http://localhost:3001'}/dashboard`);
});

// Authenticated user info endpoint
const jwtAuth = require('../middleware/jwtAuth');
router.get('/me', jwtAuth, (req, res) => {
  res.json({ user: req.user });
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

module.exports = router; 