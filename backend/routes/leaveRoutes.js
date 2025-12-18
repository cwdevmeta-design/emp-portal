const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, verifyRole } = require('../utils/authMiddleware');

router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/my', verifyToken, leaveController.getMyRequests);

// Manager Routes
router.get('/pending', verifyRole(['Admin', 'Manager']), leaveController.getPendingRequests);
router.put('/:id/action', verifyRole(['Admin', 'Manager']), leaveController.updateStatus);

module.exports = router;
