const express = require('express');
const router = express.Router();
const UsersModel = require('../model/UsersModel');
const jwtAuth = require('../middleware/jwtAuth');

// GET /profile
router.get('/profile', jwtAuth, async (req, res) => {
  try {
    const user = await UsersModel.findById(req.user.id).select('name email photo');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /profile
router.put('/profile', jwtAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const user = await UsersModel.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true, select: 'name email photo' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /profile/password
router.put('/profile/password', (req, res) => {
  // TODO: Implement change password logic
  res.send('Change password endpoint');
});

// DELETE /profile
router.delete('/profile', jwtAuth, async (req, res) => {
  try {
    const user = await UsersModel.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /profile/avatar
router.post('/profile/avatar', jwtAuth, require('../middleware/upload').single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Save file path as user photo
    const photoUrl = `/uploads/images/${req.file.filename}`;
    const user = await UsersModel.findByIdAndUpdate(
      req.user.id,
      { photo: photoUrl },
      { new: true, select: 'name email photo' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, photo: photoUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 