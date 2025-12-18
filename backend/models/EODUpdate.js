const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EODUpdate = sequelize.define('EODUpdate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    task_description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    hours_spent: {
        type: DataTypes.DECIMAL(4, 2), // e.g. 8.50
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('In Progress', 'Completed', 'Blocked'),
        defaultValue: 'In Progress'
    }
}, {
    timestamps: true,
    tableName: 'eod_updates'
});

module.exports = EODUpdate;
