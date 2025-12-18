const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const { connectDB, sequelize } = require('./config/database');

dotenv.config();

// Configs
require('./config/passport');

const app = express();

// Connect to Database
connectDB().then(() => {
    // Sync models
    sequelize.sync({ alter: true })
        .then(() => console.log('Database Synced'))
        .catch(err => console.error('Database Sync Error:', err));
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://emp.portal.eduwhistle.com', // Frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/eod', require('./routes/eodRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Associations (Temporary place, better in models/index.js)
const User = require('./models/User');
const EODUpdate = require('./models/EODUpdate');
const LeaveRequest = require('./models/LeaveRequest');
const Notification = require('./models/Notification');

User.hasMany(EODUpdate, { foreignKey: 'user_id', as: 'eod_updates' });
EODUpdate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(LeaveRequest, { foreignKey: 'user_id', as: 'leave_requests' });
LeaveRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Self Association for Manager
User.belongsTo(User, { as: 'manager', foreignKey: 'manager_id' });
User.hasMany(User, { as: 'subordinates', foreignKey: 'manager_id' });

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Employee Management Portal API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5173;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
