const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction 
  ? 'https://cseproject2.onrender.com' 
  : 'http://localhost:3000';

// GitHub Strategy Configuration
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/auth/github/callback`,
  scope: ['user:email'],
  proxy: true // Required for Render.com
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(null, false, { message: 'No email provided by GitHub' });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { githubId: profile.id },
        { email: email.toLowerCase() }
      ]
    });

    if (!user) {
      user = await User.create({
        githubId: profile.id,
        email: email.toLowerCase(),
        displayName: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value
      });
    } else if (!user.githubId) {
      // Update existing user with GitHub credentials
      user.githubId = profile.id;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Simple Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Basic Deserialization
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Authentication check middleware
passport.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
};

module.exports = passport;