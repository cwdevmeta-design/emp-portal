const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const User = require('../models/User'); // Import User model

const authController = {
    // ... existing callback ...
    callback: (req, res) => {
        try {
            if (!req.user) {
                return res.redirect('http://localhost:5173/login?error=auth_failed');
            }

            const accessToken = generateAccessToken(req.user);
            const refreshToken = generateRefreshToken(req.user);

            // Send refresh token as HttpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/api/auth/refresh',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.redirect(`http://localhost:5173/auth/success?token=${accessToken}`);

        } catch (error) {
            console.error(error);
            res.redirect('http://localhost:5173/login?error=server_error');
        }
    },

    refresh: (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid refresh token' });

            try {
                // Fetch User to get current Role
                const user = await User.findByPk(decoded.id);
                if (!user) return res.status(404).json({ message: 'User not found' });

                const accessToken = jwt.sign(
                    { id: user.id, role: user.role, name: user.name, status: user.status }, // Include Role, Name & Status
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION || '15m' }
                );

                res.json({ accessToken });
            } catch (dbErr) {
                res.status(500).json({ message: 'Server Error during refresh' });
            }
        });
    },

    logout: (req, res) => {
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
        res.json({ message: 'Logged out successfully' });
    }
};

module.exports = authController;
