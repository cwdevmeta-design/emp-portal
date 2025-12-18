const express = require('express');
const router = express.Router();
const eodController = require('../controllers/eodController');
const { verifyToken, verifyRole } = require('../utils/authMiddleware');

// Validations could be added here

router.post('/', verifyToken, eodController.submitUpdate);
router.get('/my', verifyToken, eodController.getMyUpdates);
router.get('/team', verifyRole(['Admin', 'Manager']), eodController.getTeamUpdates);
router.get('/export', verifyRole(['Admin', 'Manager']), eodController.exportEOD);

module.exports = router;
