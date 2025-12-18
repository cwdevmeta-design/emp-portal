const Notification = require('../models/Notification');

const notificationController = {
    getMyNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const notifications = await Notification.findAll({
                where: { user_id: userId },
                order: [['createdAt', 'DESC']],
                limit: 20
            });
            res.json(notifications);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const notification = await Notification.findByPk(id);

            if (notification && notification.user_id === req.user.id) {
                notification.is_read = true;
                await notification.save();
                res.json({ message: 'Marked as read' });
            } else {
                res.status(404).json({ message: 'Notification not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            await Notification.update({ is_read: true }, {
                where: { user_id: userId, is_read: false }
            });
            res.json({ message: 'All marked as read' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = notificationController;
