const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

// Environment-aware configuration
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction 
  ? process.env.BASE_URL || 'https://your-app.onrender.com' 
  : 'http://localhost:5000';

// Dynamic callback URL
const getCallbackUrl = () => {
  if (process.env.GITHUB_CALLBACK_URL) {
    return process.env.GITHUB_CALLBACK_URL;
  }
  return `${BASE_URL}/auth/github/callback`;
};

// GitHub Strategy Configuration
const githubStrategy = new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: getCallbackUrl(),
  scope: ['user:email'],
  passReqToCallback: true,
  proxy: isProduction // Important for HTTPS behind proxy (like Render)
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    if (!isProduction) {
      console.log('GitHub Profile:', profile);
    }

    // Normalize profile data
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;
    const username = profile.username || profile.displayName?.replace(/\s+/g, '').toLowerCase();

    if (!email) {
      return done(null, false, { message: 'No email provided by GitHub' });
    }

    // Check for existing user
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
        username: username,
        displayName: profile.displayName || username,
        authType: 'github',
        avatar: avatar
      });
    } else {
      // Update existing user if needed
      if (!user.githubId) {
        user.githubId = profile.id;
        user.authType = 'github';
        await user.save();
      }
      
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    return done(null, user);
  } catch (err) {
    console.error('GitHub Authentication Error:', err);
    return done(err);
  }
});

passport.use('github', githubStrategy);

// Serialization
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    authType: user.authType
  });
});

// Deserialization with enhanced error handling
passport.deserializeUser(async (obj, done) => {
  try {
    const user = await User.findById(obj.id);
    
    if (!user) {
      console.error('User not found during deserialization');
      return done(null, false);
    }

    // Ensure authType matches
    if (user.authType !== obj.authType) {
      console.error('Authentication type mismatch');
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    console.error('Deserialization Error:', err);
    done(err);
  }
});

// Session verification middleware (optional)
passport.checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  
  if (isProduction) {
    return res.status(401).json({ error: 'Unauthorized' });
  } else {
    return res.status(401).json({ 
      error: 'Unauthorized',
      debug: 'Not authenticated',
      loginUrl: `${BASE_URL}/auth/github`
    });
  }
};

module.exports = passport;