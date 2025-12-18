const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, verifyRole } = require('../utils/authMiddleware');

// Mark Attendance (All authenticated users)
router.post('/', verifyToken, attendanceController.markAttendance);

// Get My History
router.get('/my', verifyToken, attendanceController.getMyAttendance);

// Get Team Status (Manager/Admin)
router.get('/dashboard', verifyRole(['Admin', 'Manager']), attendanceController.getTeamStatus);

// Export CSV
router.get('/export', verifyRole(['Admin', 'Manager']), attendanceController.exportAttendance);

module.exports = router;
