const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// POST /rooms/:roomId/transaction
router.post('/rooms/:roomId/transaction', (req, res) => {
  // TODO: Implement initiate payment logic
  res.send('Initiate payment endpoint');
});

// GET /transactions/:transactionId
router.get('/:transactionId', (req, res) => {
  // TODO: Implement get transaction details logic
  res.send('Get transaction details endpoint');
});

// POST /transactions/:transactionId/proof
router.post('/:transactionId/proof', (req, res) => {
  // TODO: Implement upload delivery proof logic
  res.send('Upload delivery proof endpoint');
});

// POST /transactions/:transactionId/verify
router.post('/:transactionId/verify', (req, res) => {
  // TODO: Implement verify delivery logic
  res.send('Verify delivery endpoint');
});

// POST /transactions/:transactionId/release
router.post('/:transactionId/release', (req, res) => {
  // TODO: Implement release funds logic
  res.send('Release funds endpoint');
});

// POST /transactions/:transactionId/dispute
router.post('/:transactionId/dispute', (req, res) => {
  // TODO: Implement raise dispute logic
  res.send('Raise dispute endpoint');
});

// POST /transactions/:transactionId/refund
router.post('/:transactionId/refund', (req, res) => {
  // TODO: Implement refund logic
  res.send('Refund endpoint');
});

// POST /transactions/:transactionId/ai-review
router.post('/:transactionId/ai-review', transactionController.aiReview);

// POST /transactions/:transactionId/ai-accept
router.post('/:transactionId/ai-accept', transactionController.aiAccept);

// POST /transactions/:transactionId/ai-reject
router.post('/:transactionId/ai-reject', transactionController.aiReject);

module.exports = router; 