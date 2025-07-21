const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const { signToken } = require('../utils/jwt');

// Start Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT
  const token = signToken(req.user);
  // Send token to frontend (you can also set as cookie if you want)
  res.json({ token });
});

// Logout (for JWT, just clear token on frontend)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router; 