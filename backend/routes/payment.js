const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const jwtAuth = require('../middleware/jwtAuth');

// POST /payment/create-order - Create Razorpay order
router.post('/create-order', jwtAuth, paymentController.createOrder);

// POST /payment/verify - Verify payment signature
router.post('/verify', jwtAuth, paymentController.verifyPayment);

// GET /payment/status/:transactionId - Get payment status
router.get('/status/:transactionId', jwtAuth, paymentController.getPaymentStatus);

// POST /payment/refund/:transactionId - Process refund
router.post('/refund/:transactionId', jwtAuth, paymentController.refundPayment);

// Webhook routes for Razorpay
router.post('/webhook', paymentController.handleWebhook);
router.post('/webhook/payout', paymentController.handlePayoutWebhook);

// POST /payment/release/:transactionId - Release payment to seller
router.post('/release/:transactionId', jwtAuth, paymentController.releasePayment);

module.exports = router;
