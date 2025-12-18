const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyRole, verifyToken } = require('../utils/authMiddleware');

// Get all users (Admin & Manager can view)
router.get('/', verifyRole(['Admin', 'Manager']), userController.getAllUsers);

// Get Managers list (Authenticated users needed for dropdowns)
router.get('/managers', verifyToken, userController.getManagers);

// Get single user
router.get('/:id', verifyRole(['Admin', 'Manager']), userController.getUserById);

// Update user (Admin only)
router.put('/:id', verifyRole(['Admin']), userController.updateUser);

// Create user (Admin only)
router.post('/', verifyRole(['Admin']), userController.createUser);

// Delete user (Admin only)
router.delete('/:id', verifyRole(['Admin']), userController.deleteUser);

module.exports = router;
