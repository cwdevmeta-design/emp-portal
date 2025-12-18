const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const reportController = {
    // Top-level stats cards
    getStats: async (req, res) => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Total Employees
            const totalUsers = await User.count({ where: { role: { [Op.ne]: 'Admin' } } });

            // 2. Present Today (WFO + WFH)
            const presentToday = await Attendance.count({
                where: {
                    date: today,
                    status: { [Op.in]: ['WFO', 'WFH'] }
                }
            });

            // 3. On Leave Today
            const onLeave = await Attendance.count({
                where: {
                    date: today,
                    status: 'Leave'
                }
            });

            // 4. Pending Requests
            let pendingRequests = 0;
            let pendingUserApprovals = 0;

            if (req.user.role === 'Admin') {
                // Admin sees pending user approvals (users awaiting activation - Pending or null status)
                pendingRequests = await User.count({
                    where: {
                        [Op.or]: [
                            { status: 'Pending' },
                            { status: null }
                        ]
                    }
                });
                // Also track leave requests separately
                pendingUserApprovals = await LeaveRequest.count({
                    where: { status: 'Pending' }
                });
            } else if (req.user.role === 'Manager') {
                // Manager sees only their team's pending leave requests
                const teamUsers = await User.findAll({
                    where: { manager_id: req.user.id },
                    attributes: ['id']
                });
                const teamUserIds = teamUsers.map(u => u.id);

                if (teamUserIds.length > 0) {
                    pendingRequests = await LeaveRequest.count({
                        where: {
                            status: 'Pending',
                            user_id: { [Op.in]: teamUserIds }
                        }
                    });
                }
            }

            res.json({
                totalUsers,
                presentToday,
                onLeave,
                pendingRequests,
                pendingUserApprovals // Only populated for Admin
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Monthly Heatmap / Matrix
    getMonthlyAttendance: async (req, res) => {
        try {
            const { month, year } = req.query;
            if (!month || !year) return res.status(400).json({ message: "Month and Year required" });

            // Create range
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            // Last day of month
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

            // Fetch all users (exclude Admins, filter by manager for Manager role)
            const whereClause = { role: { [Op.ne]: 'Admin' }, status: 'Active' };
            if (req.user && req.user.role === 'Manager') {
                whereClause.manager_id = req.user.id;
                console.log('Manager filtering - Manager ID:', req.user.id);
            }

            console.log('Monthly Attendance - Where Clause:', JSON.stringify(whereClause, null, 2));

            const users = await User.findAll({
                where: whereClause,
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            console.log('Users found:', users.length, users.map(u => ({ id: u.id, name: u.name })));

            // Fetch all attendance for this range
            const attendanceRecords = await Attendance.findAll({
                where: {
                    date: { [Op.between]: [startDate, endDate] }
                }
            });

            // Build Matrix
            // Structure: [ { user: {name}, records: { '2025-01-01': 'WFO', ... } } ]
            const matrix = users.map(user => {
                const userRecords = attendanceRecords.filter(r => r.user_id === user.id);
                const dailyMap = {};
                userRecords.forEach(r => {
                    dailyMap[r.date] = r.status;
                });
                return {
                    user,
                    days: dailyMap
                };
            });

            res.json({ matrix, daysInMonth: lastDay });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },


    // 2. Leave Utilization (User vs Type)
    getLeaveUtilization: async (req, res) => {
        try {
            // Build where clause for user filtering
            const userWhere = { role: { [Op.ne]: 'Admin' }, status: 'Active' };
            if (req.user && req.user.role === 'Manager') {
                userWhere.manager_id = req.user.id;
            }

            const leaves = await LeaveRequest.findAll({
                attributes: [
                    'user_id',
                    'leave_type',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('days_count')), 'total_days']
                ],
                where: { status: 'Approved' },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['name'],
                    where: userWhere
                }],
                group: ['user_id', 'leave_type', 'user.id']
            });
            res.json(leaves);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // 3. Project Hours Distribution
    getProjectPerformance: async (req, res) => {
        try {
            const projectStats = await sequelize.query(`
                SELECT project_name, SUM(hours_spent) as total_hours, COUNT(DISTINCT user_id) as contributor_count
                FROM eod_updates
                GROUP BY project_name
                ORDER BY total_hours DESC
            `, { type: sequelize.QueryTypes.SELECT });

            res.json(projectStats);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // 4. EOD Compliance (Missing Entries)
    getEODCompliance: async (req, res) => {
        try {
            const { month, year } = req.query;
            if (!month || !year) return res.status(400).json({ message: "Month and Year required" });

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

            // Calculate working days (Mon-Fri) up to today or end of month, whichever is earlier
            let expectedDays = 0;
            const countUntil = today < endDate ? today : endDate;

            for (let d = new Date(startDate); d <= countUntil; d.setDate(d.getDate() + 1)) {
                if (d.getDay() !== 0 && d.getDay() !== 6) expectedDays++;
            }

            // Build where clause (exclude Admins, filter by manager for Manager role)
            const whereClause = { role: { [Op.ne]: 'Admin' }, status: 'Active' };
            if (req.user && req.user.role === 'Manager') {
                whereClause.manager_id = req.user.id;
            }

            const users = await User.findAll({
                where: whereClause,
                attributes: ['id', 'name'],
                include: [{
                    model: require('../models/EODUpdate'),
                    as: 'eod_updates',
                    required: false,
                    where: {
                        date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] }
                    },
                    attributes: ['date']
                }]
            });

            const report = users.map(u => {
                const submittedCount = u.eod_updates.length;
                const complianceRate = Math.round((submittedCount / expectedDays) * 100);
                return {
                    name: u.name,
                    submitted: submittedCount,
                    expected: expectedDays,
                    rate: complianceRate > 100 ? 100 : complianceRate,
                    missing: expectedDays - submittedCount
                };
            });

            res.json(report);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = reportController;
