const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

// Google
router.get('/google', passport.authenticate('google', { session: false }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=failed' }),
    authController.callback
);

// Microsoft
router.get('/microsoft', passport.authenticate('microsoft', { session: false }));
router.get('/microsoft/callback',
    passport.authenticate('microsoft', { session: false, failureRedirect: 'http://localhost:5173/login?error=failed' }),
    authController.callback
);

// Utils
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
