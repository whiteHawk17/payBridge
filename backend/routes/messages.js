const express = require('express');
const router = express.Router();

// GET /rooms/:roomId/messages
router.get('/rooms/:roomId/messages', (req, res) => {
  // TODO: Implement get messages logic
  res.send('Get messages endpoint');
});

// POST /rooms/:roomId/messages
router.post('/rooms/:roomId/messages', (req, res) => {
  // TODO: Implement send message logic
  res.send('Send message endpoint');
});

module.exports = router; 