const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../utils/authMiddleware');

router.get('/', verifyToken, notificationController.getMyNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);

module.exports = router;
