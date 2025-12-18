const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            let user = await User.findOne({ where: { email } });

            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    if (!user.avatar) user.avatar = profile.photos[0]?.value;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName,
                email: email,
                googleId: profile.id,
                avatar: profile.photos[0]?.value,
                status: 'Pending'
            });
            done(null, user);
        } catch (err) {
            console.error('Google Auth Error:', err);
            done(err, null);
        }
    }
));

// Microsoft Strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    scope: ['user.read']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : profile._json.mail || profile._json.userPrincipalName;

            let user = await User.findOne({ where: { email } });

            if (user) {
                if (!user.microsoftId) {
                    user.microsoftId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName,
                email: email,
                microsoftId: profile.id,
                status: 'Pending'
            });
            done(null, user);
        } catch (err) {
            console.error('Microsoft Auth Error:', err);
            done(err, null);
        }
    }
));
