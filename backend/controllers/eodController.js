const EODUpdate = require('../models/EODUpdate');
const User = require('../models/User');
const { Op } = require('sequelize');

const eodController = {
    // Submit EOD Update
    submitUpdate: async (req, res) => {
        try {
            const { project_name, task_description, hours_spent, status, date } = req.body;
            const userId = req.user.id;
            const entryDate = date || new Date().toISOString().split('T')[0];

            const newUpdate = await EODUpdate.create({
                user_id: userId,
                date: entryDate,
                project_name,
                task_description,
                hours_spent,
                status
            });

            res.status(201).json({ message: 'EOD Update submitted successfully', update: newUpdate });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get My Updates (History)
    getMyUpdates: async (req, res) => {
        try {
            const userId = req.user.id;
            const updates = await EODUpdate.findAll({
                where: { user_id: userId },
                order: [['date', 'DESC'], ['createdAt', 'DESC']],
                limit: 50
            });
            res.json(updates);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get Team Updates (Admin/Manager)
    getTeamUpdates: async (req, res) => {
        try {
            const { date, user_id, startDate, endDate, project } = req.query;
            const whereClause = {};

            // Date Range or Single Date
            if (startDate && endDate) {
                whereClause.date = { [Op.between]: [startDate, endDate] };
            } else if (date) {
                whereClause.date = date;
            }

            if (user_id) whereClause.user_id = user_id;

            // Project Wildcard Search
            if (project) {
                whereClause.project_name = { [Op.like]: `%${project}%` };
            }

            // Role-based filtering
            const userIncludeFn = {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'avatar', 'role', 'designation'],
                where: { role: { [Op.ne]: 'Admin' } }
            };

            // If Manager, only show subordinates (and potentially themselves if needed, but keeping strict to request "linked employees")
            if (req.user.role === 'Manager') {
                userIncludeFn.where.manager_id = req.user.id;
            }

            const updates = await EODUpdate.findAll({
                where: whereClause,
                include: [userIncludeFn],
                order: [['date', 'DESC'], ['user_id', 'ASC']]
            });

            res.json(updates);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Export EOD CSV
    exportEOD: async (req, res) => {
        try {
            // Similar logic, fetch updates with User include
            const { startDate, endDate } = req.query;
            const start = startDate || new Date().toISOString().split('T')[0];
            const end = endDate || start;

            // Role-based filtering for Export
            const userIncludeFn = {
                model: User,
                as: 'user',
                attributes: ['name', 'role'],
                where: {}
            };

            if (req.user.role === 'Manager') {
                userIncludeFn.where.manager_id = req.user.id;
            }

            const updates = await EODUpdate.findAll({
                where: {
                    date: { [Op.between]: [start, end] }
                },
                include: [userIncludeFn],
                order: [['date', 'ASC'], ['user_id', 'ASC']]
            });

            // Flatten
            const data = updates.map(u => ({
                Date: u.date,
                Name: u.user ? u.user.name : 'Unknown',
                Role: u.user ? u.user.role : '',
                Project: u.project_name,
                Task: u.task_description,
                Hours: u.hours_spent,
                Status: u.status
            }));

            const { Parser } = require('json2csv');
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment(`eod_${start}_to_${end}.csv`);
            return res.send(csv);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = eodController;
