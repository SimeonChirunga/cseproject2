const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

// Configure GitHub Strategy
const githubStrategy = new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email'],
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('GitHub Profile:', profile);
        
        let user = await User.findOne({ githubId: profile.id });
        
        if (!user) {
            user = await User.create({
                githubId: profile.id,
                email: profile.emails?.[0]?.value,
                displayName: profile.displayName || profile.username,
                authType: 'github'
            });
        }
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

// Register the strategy with a name
passport.use('github', githubStrategy);

// Serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;