const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        // Sync models here later
        // await sequelize.sync({ alter: true });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
