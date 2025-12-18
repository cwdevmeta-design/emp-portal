const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            name: user.name,
            status: user.status // Add status here
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
    );
};

module.exports = { generateAccessToken, generateRefreshToken };
