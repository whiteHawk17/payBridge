const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const jwtAuth = require('../middleware/jwtAuth');

// GET /dashboard/stats
router.get('/dashboard/stats', jwtAuth, dashboardController.getDashboardStats);

// GET /rooms/active
router.get('/rooms/active', jwtAuth, dashboardController.getActiveRooms);

// POST /rooms
router.post('/rooms', jwtAuth, dashboardController.createRoom);

// GET /rooms/:roomId
router.get('/rooms/:roomId', jwtAuth, dashboardController.getRoomDetails);

// GET /profile
router.get('/profile', jwtAuth, dashboardController.getProfile);

// POST /logout
router.post('/logout', jwtAuth, dashboardController.logout);

module.exports = router; 