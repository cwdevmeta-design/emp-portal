const User = require('../models/User');
const { Op } = require('sequelize');

const userController = {
    // Get all users with filters
    getAllUsers: async (req, res) => {
        try {
            const { role, department, designation, search } = req.query;
            const whereClause = {};

            if (role) whereClause.role = role;
            if (department) whereClause.department = department;
            if (designation) whereClause.designation = designation;

            if (search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ];
            }

            // Exclude Admins from the list by default
            if (!role) {
                whereClause.role = { [Op.ne]: 'Admin' };
            }

            // If Manager, only show their direct reports
            if (req.user && req.user.role === 'Manager') {
                whereClause.manager_id = req.user.id;
            }

            const users = await User.findAll({
                where: whereClause,
                attributes: { exclude: ['password', 'googleId', 'microsoftId', 'createdAt', 'updatedAt'] },
                include: [{
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'name']
                }]
            });

            res.json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get User by ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Update User (Admin only)
    updateUser: async (req, res) => {
        try {
            const { role, department, designation, manager_id, status } = req.body;
            const user = await User.findByPk(req.params.id);

            if (!user) return res.status(404).json({ message: 'User not found' });

            // Only allow updating specific fields
            if (role) user.role = role;
            if (department) user.department = department;
            if (designation) user.designation = designation;
            if (manager_id !== undefined) user.manager_id = manager_id;
            if (status) user.status = status;

            await user.save();
            res.json({ message: 'User updated successfully', user });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Create User (Admin only)
    createUser: async (req, res) => {
        try {
            const { name, email, role, department, designation, manager_id, status } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const newUser = await User.create({
                name,
                email,
                role,
                department,
                designation,
                manager_id,
                status: status || 'Active',
                // Default passwords orauth handling would be here if manual login was primary
                // For now assuming these are placeholder or OAuth users
                googleId: 'manual_' + email, // Placeholder
            });

            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Delete User (Admin only)
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            await user.destroy();
            res.json({ message: 'User deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get all potential managers
    getManagers: async (req, res) => {
        try {
            const managers = await User.findAll({
                where: { role: { [Op.or]: ['Manager', 'Admin'] } },
                attributes: ['id', 'name', 'email']
            });
            res.json(managers);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = userController;
