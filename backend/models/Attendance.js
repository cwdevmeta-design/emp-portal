const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('WFO', 'WFH', 'Leave'),
        allowNull: false
    },
    check_in_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'attendance',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'date']
        }
    ]
});

// Association setup in a central file usually, but for now we rely on logical FKs or manual associations if needed.
// Ideally: User.hasMany(Attendance)
// But for simplicty we just use user_id.

module.exports = Attendance;
