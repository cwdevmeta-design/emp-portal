const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Op } = require('sequelize');

const CUTOFF_HOUR = 11; // 11 AM

const attendanceController = {
    // Mark Attendance
    markAttendance: async (req, res) => {
        try {
            const { status, date } = req.body; // Date optional, defaults to today
            const userId = req.user.id;

            const today = new Date();
            const targetDate = date ? new Date(date) : today;
            const dateString = targetDate.toISOString().split('T')[0];

            // Check Check-in Time logic (11 AM)
            // Only strictly apply cutoff for "TODAY". Past dates are assumed locked unless Admin override (not impl yet).
            // Future dates: Maybe allow leave application? For now simple logic.

            // If today
            if (dateString === today.toISOString().split('T')[0]) {
                const currentHour = today.getHours();
                if (currentHour >= CUTOFF_HOUR) {
                    return res.status(400).json({ message: 'Attendance marking currently closed (Cutoff 11 AM).' });
                }
            }

            // Upsert (Create or Update)
            const [attendance, created] = await Attendance.findOrCreate({
                where: { user_id: userId, date: dateString },
                defaults: { status, check_in_time: new Date() }
            });

            if (!created) {
                // Update existing if not locked
                if (attendance.is_locked) {
                    return res.status(400).json({ message: 'Attendance record is locked.' });
                }
                attendance.status = status;
                attendance.check_in_time = new Date(); // Update time? Instructions say "until 11 AM".
                await attendance.save();
            }

            res.json({ message: 'Attendance marked successfully', attendance });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get My Attendance History (or current status)
    getMyAttendance: async (req, res) => {
        try {
            const userId = req.user.id;
            const { month, year } = req.query; // Optional filters

            const whereClause = { user_id: userId };

            if (month && year) {
                // Simple date range for month
                // Implementation skipped for brevity, defaulting to "Today" or "Recent"
                // Let's just return all for now or limit 30
            }

            const records = await Attendance.findAll({
                where: whereClause,
                order: [['date', 'DESC']],
                limit: 31
            });
            res.json(records);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get Team Status (Admin/Manager Dashboard)
    getTeamStatus: async (req, res) => {
        try {
            const { date, role, department } = req.query;
            const targetDate = date || new Date().toISOString().split('T')[0];

            const whereUser = {
                role: { [Op.ne]: 'Admin' } // Exclude Admins
            };
            if (role) whereUser.role = role;
            if (department) whereUser.department = department;

            // Restrict Managers to their own team
            if (req.user.role === 'Manager') {
                whereUser.manager_id = req.user.id;
            }

            // Fetch all users matching filter
            console.log('--- getTeamStatus Debug ---');
            console.log('Request Query:', req.query);
            console.log('User Role:', req.user.role, 'ID:', req.user.id);
            console.log('Where Clause:', JSON.stringify(whereUser, null, 2));

            const users = await User.findAll({
                where: whereUser,
                attributes: ['id', 'name', 'email', 'avatar', 'role', 'department', 'designation', 'manager_id']
            });
            console.log('Users Found:', users.length);

            // Fetch attendance for these users on target date
            const attendanceRecords = await Attendance.findAll({
                where: {
                    date: targetDate,
                    user_id: { [Op.in]: users.map(u => u.id) }
                }
            });

            // Merge Data
            const result = users.map(user => {
                const record = attendanceRecords.find(a => a.user_id === user.id);
                return {
                    ...user.toJSON(),
                    attendance: record ? record.status : 'Not Marked',
                    check_in_time: record ? record.check_in_time : null
                };
            });

            res.json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Export Attendance CSV
    exportAttendance: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate || new Date().toISOString().split('T')[0];
            const end = endDate || start; // Default to single day if no end date

            // Fetch Attendance with User data
            const records = await Attendance.findAll({
                where: {
                    date: { [Op.between]: [start, end] }
                },
                order: [['date', 'ASC']],
            });

            // We need manual join if association isn't perfect, or just fetch users.
            // Efficient way: Fetch all relevant users or just map manually.
            const userIds = [...new Set(records.map(r => r.user_id))];
            const users = await User.findAll({
                where: { id: { [Op.in]: userIds } },
                attributes: ['id', 'name', 'role', 'department']
            });
            const userMap = {};
            users.forEach(u => userMap[u.id] = u);

            // Flatten Data for CSV
            const data = records.map(r => {
                const user = userMap[r.user_id] || { name: 'Unknown', role: 'N/A', department: 'N/A' };
                return {
                    Date: r.date,
                    Name: user.name,
                    Role: user.role,
                    Department: user.department,
                    Status: r.status,
                    CheckInTime: r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : ''
                };
            });

            // Convert to CSV
            const { Parser } = require('json2csv');
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment(`attendance_${start}_to_${end}.csv`);
            return res.send(csv);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = attendanceController;
