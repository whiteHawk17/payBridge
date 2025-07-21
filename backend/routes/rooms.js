const express = require('express');
const router = express.Router();

// POST /rooms
router.post('/', (req, res) => {
  // TODO: Implement create room logic
  res.send('Create room endpoint');
});

// GET /rooms
router.get('/', (req, res) => {
  // TODO: Implement list rooms logic
  res.send('List rooms endpoint');
});

// GET /rooms/:roomId
router.get('/:roomId', (req, res) => {
  // TODO: Implement get room details logic
  res.send('Get room details endpoint');
});

// POST /rooms/:roomId/invite
router.post('/:roomId/invite', (req, res) => {
  // TODO: Implement invite counterparty logic
  res.send('Invite counterparty endpoint');
});

// POST /rooms/:roomId/invite/accept
router.post('/:roomId/invite/accept', (req, res) => {
  // TODO: Implement accept invitation logic
  res.send('Accept invitation endpoint');
});

// POST /rooms/:roomId/invite/reject
router.post('/:roomId/invite/reject', (req, res) => {
  // TODO: Implement reject invitation logic
  res.send('Reject invitation endpoint');
});

// PATCH /rooms/:roomId/status
router.patch('/:roomId/status', (req, res) => {
  // TODO: Implement update room status logic
  res.send('Update room status endpoint');
});

module.exports = router; 