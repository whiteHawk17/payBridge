const express = require('express');
const router = express.Router();
const { generateZegoToken, generateUserId, APP_ID, SERVER_URL, BACKUP_SERVER_URL } = require('../config/zegocloud');
const jwtAuth = require('../middleware/jwtAuth');

// Generate ZEGOCLOUD video token
router.post('/token', jwtAuth, async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Generate unique user ID for ZEGOCLOUD
    const zegoUserId = generateUserId(userName, userId);
    
    // Generate the video token
    const token = generateZegoToken(zegoUserId, roomId);
    
    console.log(`Generated ZEGOCLOUD token for user ${zegoUserId} in room ${roomId}`);
    
    res.json({
      token,
      userId: zegoUserId,
      roomId,
      appId: APP_ID,
      serverUrl: SERVER_URL,
      backupServerUrl: BACKUP_SERVER_URL
    });
  } catch (error) {
    console.error('Error generating ZEGOCLOUD token:', error);
    res.status(500).json({ error: 'Failed to generate video token', details: error.message });
  }
});

module.exports = router; 