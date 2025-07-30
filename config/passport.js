const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

// GitHub Strategy Configuration
const githubStrategy = new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL, 
    scope: ['user:email'],
    passReqToCallback: true,
    proxy: true // Important for HTTPS behind proxy (like Render)
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('GitHub Profile:', profile);
        
        // Check for existing user by GitHub ID or email
        let user = await User.findOne({ 
            $or: [
                { githubId: profile.id },
                { email: profile.emails?.[0]?.value }
            ]
        });

        if (!user) {
            // Create new user
            user = await User.create({
                githubId: profile.id,
                email: profile.emails?.[0]?.value,
                displayName: profile.displayName || profile.username,
                authType: 'github',
                avatar: profile.photos?.[0]?.value
            });
        } else if (!user.githubId) {
            // Merge accounts if email exists but GitHub ID missing
            user.githubId = profile.id;
            user.authType = 'github';
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        console.error('GitHub Authentication Error:', err);
        return done(null, false, { 
            message: 'Authentication failed',
            error: err.message 
        });
    }
});

passport.use('github', githubStrategy);

// Serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialization with error handling
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return done(new Error('User not found'));
        }
        done(null, user);
    } catch (err) {
        console.error('Deserialization Error:', err);
        done(err);
    }
});

module.exports = passport;