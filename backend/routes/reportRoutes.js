const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyRole } = require('../utils/authMiddleware');

router.get('/stats', verifyRole(['Admin', 'Manager']), reportController.getStats);
router.get('/monthly', verifyRole(['Admin', 'Manager']), reportController.getMonthlyAttendance);
router.get('/leave-utilization', verifyRole(['Admin', 'Manager']), reportController.getLeaveUtilization);
router.get('/project-performance', verifyRole(['Admin', 'Manager']), reportController.getProjectPerformance);
router.get('/eod-compliance', verifyRole(['Admin', 'Manager']), reportController.getEODCompliance);

module.exports = router;
