const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token is not valid' });
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ message: 'You are not authenticated!' });
    }
};

const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        verifyToken(req, res, () => {
            if (allowedRoles.includes(req.user.role)) {
                next();
            } else {
                res.status(403).json({ message: 'You are not allowed to do that!' });
            }
        });
    };
};

module.exports = { verifyToken, verifyRole };
