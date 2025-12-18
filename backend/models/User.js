const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.ENUM('Admin', 'Manager', 'Employee'),
        defaultValue: 'Employee'
    },
    department: {
        type: DataTypes.STRING
    },
    designation: {
        type: DataTypes.STRING
    },
    manager_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Pending'),
        defaultValue: 'Pending'
    },
    googleId: {
        type: DataTypes.STRING,
        unique: true
    },
    microsoftId: {
        type: DataTypes.STRING,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'users'
});

module.exports = User;
