const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { Op } = require('sequelize');

const leaveController = {
    // Apply for Leave/WFH
    applyLeave: async (req, res) => {
        try {
            const { type, start_date, end_date, reason } = req.body;
            const userId = req.user.id;

            const Notification = require('../models/Notification'); // Add this import

            // ...

            const newRequest = await LeaveRequest.create({
                user_id: userId,
                type,
                start_date,
                end_date,
                reason
            });

            // Notify Manager
            const user = await User.findByPk(userId);
            if (user && user.manager_id) {
                await Notification.create({
                    user_id: user.manager_id,
                    title: 'New Leave Request',
                    type: 'info',
                    message: `${user.name} has requested for ${type} from ${start_date} to ${end_date}`,
                    is_read: false
                });
            }

            res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
        } catch (err) {
            console.error("Leave Apply Error:", err);
            res.status(500).json({ message: err.message });
        }
    },

    // Get My Requests (History)
    getMyRequests: async (req, res) => {
        try {
            const userId = req.user.id;
            const { month, year } = req.query;

            let whereClause = { user_id: userId };

            // If month and year are provided, filter by date range
            if (month && year) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0); // Last day of the month

                whereClause.start_date = {
                    [Op.between]: [
                        startDate.toISOString().split('T')[0],
                        endDate.toISOString().split('T')[0]
                    ]
                };
            }

            const requests = await LeaveRequest.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get Pending Requests (For Managers)
    getPendingRequests: async (req, res) => {
        try {
            const managerId = req.user.id;

            // Find all users who report to this manager
            const reportees = await User.findAll({
                where: { manager_id: managerId },
                attributes: ['id']
            });

            const reporteeIds = reportees.map(u => u.id);

            if (reporteeIds.length === 0) {
                return res.json([]);
            }

            // Find pending requests from these users
            const requests = await LeaveRequest.findAll({
                where: {
                    user_id: { [Op.in]: reporteeIds },
                    status: 'Pending'
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar', 'designation']
                }],
                order: [['createdAt', 'ASC']]
            });

            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Update Status (Approve/Reject)
    updateStatus: async (req, res) => {
        try {
            const { status, manager_remarks } = req.body; // Approved / Rejected
            const { id } = req.params;

            const request = await LeaveRequest.findByPk(id, {
                include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
            });
            if (!request) return res.status(404).json({ message: 'Request not found' });

            request.status = status;
            request.manager_remarks = manager_remarks;
            await request.save();

            // Notify the employee about the decision
            const Notification = require('../models/Notification');
            await Notification.create({
                user_id: request.user_id,
                title: `Leave Request ${status}`,
                type: status === 'Approved' ? 'success' : 'warning',
                message: `Your ${request.type} request has been ${status.toLowerCase()}${manager_remarks ? '. Manager remarks: ' + manager_remarks : ''}`,
                is_read: false
            });

            res.json({ message: `Request ${status} successfully`, request });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = leaveController;
