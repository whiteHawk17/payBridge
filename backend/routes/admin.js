const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jwtAuth = require('../middleware/jwtAuth');
const requireAdmin = require('../middleware/requireAdmin');

// GET /admin/rooms?status=DISPUTE
router.get('/rooms', jwtAuth, requireAdmin, adminController.getDisputeRooms);

// POST /admin/rooms/:roomId/resolve
router.post('/rooms/:roomId/resolve', jwtAuth, requireAdmin, adminController.resolveRoomDispute);

// PATCH /admin/rooms/:roomId/status
router.patch('/rooms/:roomId/status', jwtAuth, requireAdmin, adminController.changeRoomStatus);

// GET /admin/rooms/:roomId/documents
router.get('/rooms/:roomId/documents', jwtAuth, requireAdmin, adminController.getRoomDocuments);

// GET /admin/users
router.get('/users', jwtAuth, requireAdmin, adminController.listUsers);

// PATCH /admin/users/:userId/role
router.patch('/users/:userId/role', jwtAuth, requireAdmin, adminController.changeUserRole);

// PATCH /admin/users/:userId/suspend
router.patch('/users/:userId/suspend', jwtAuth, requireAdmin, adminController.suspendUser);

// DELETE /admin/users/:userId
router.delete('/users/:userId', jwtAuth, requireAdmin, adminController.deleteUser);

// GET /admin/audit-logs
router.get('/audit-logs', jwtAuth, requireAdmin, adminController.getAuditLogs);

// GET /admin/transactions
router.get('/transactions', jwtAuth, requireAdmin, adminController.listAllTransactions);

// PATCH /admin/transactions/:transactionId/refund
router.patch('/transactions/:transactionId/refund', jwtAuth, requireAdmin, adminController.refundTransaction);

// PATCH /admin/transactions/:transactionId/flag
router.patch('/transactions/:transactionId/flag', jwtAuth, requireAdmin, adminController.flagTransaction);

// GET /admin/settings
router.get('/settings', jwtAuth, requireAdmin, adminController.getPlatformSettings);

// PATCH /admin/settings
router.patch('/settings', jwtAuth, requireAdmin, adminController.updatePlatformSettings);

// GET /admin/dashboard
router.get('/dashboard', jwtAuth, requireAdmin, adminController.getAdminDashboard);

// PATCH /admin/payouts/:transactionId/manual
router.patch('/payouts/:transactionId/manual', jwtAuth, requireAdmin, adminController.manualPayout);

// GET /admin/messages/flagged
router.get('/messages/flagged', jwtAuth, requireAdmin, adminController.getFlaggedMessages);

// POST /admin/notifications
router.post('/notifications', jwtAuth, requireAdmin, adminController.sendNotification);

// Payment monitoring and analytics routes
router.get('/analytics/payments', requireAdmin, adminController.getPaymentAnalytics);
router.get('/payouts/:transactionId', requireAdmin, adminController.getPayoutDetails);
router.post('/payouts/:transactionId/retry', requireAdmin, adminController.retryFailedPayout);
router.get('/transactions/disputed', requireAdmin, adminController.getDisputedTransactions);

module.exports = router; 