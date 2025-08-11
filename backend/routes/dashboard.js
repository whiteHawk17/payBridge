const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const jwtAuth = require('../middleware/jwtAuth');

// GET /stats
router.get('/stats', jwtAuth, dashboardController.getDashboardStats);

// GET /rooms/active
router.get('/rooms/active', jwtAuth, dashboardController.getActiveRooms);

// POST /rooms
router.post('/rooms', jwtAuth, dashboardController.createRoom);

// POST /rooms/join
router.post('/rooms/join', jwtAuth, dashboardController.joinRoom);

// GET /rooms/:roomId
router.get('/rooms/:roomId', jwtAuth, dashboardController.getRoomDetails);

// GET /transactions/:transactionId
router.get('/transactions/:transactionId', jwtAuth, dashboardController.getTransactionDetails);

// GET /profile
router.get('/profile', jwtAuth, dashboardController.getProfile);

// POST /logout
router.post('/logout', jwtAuth, dashboardController.logout);

// GET /past-transactions
router.get('/past-transactions', jwtAuth, dashboardController.getPastTransactions);

// GET /analytics
router.get('/analytics', jwtAuth, dashboardController.getAnalytics);

// POST /rooms/:roomId/seller-payment-details
router.post('/rooms/:roomId/seller-payment-details', jwtAuth, dashboardController.updateSellerPaymentDetails);

module.exports = router; 