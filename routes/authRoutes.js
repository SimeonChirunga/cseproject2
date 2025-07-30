const router = require('express').Router();
const passport = require('passport');
const { generateToken } = require('../middleware/authenticate');

// Environment-based URLs
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const loginErrorUrl = `${clientUrl}/login?error=auth_failed`;

// GitHub OAuth Login
router.get('/github', passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
}));

// GitHub OAuth Callback
router.get('/github/callback', passport.authenticate('github', { session: false }), 
  (req, res) => {
    const token = generateToken(req.user);
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000 // 1 hour
    });
    
    // Also return token in JSON for clients that can't use cookies
    res.json({ 
      success: true, 
      token, 
      user: req.user 
    });
  }
);

// Explicit error handler route
router.get('/login', (req, res) => {
    const { error } = req.query;
    
    if (error === 'auth_failed') {
        return res.status(401).json({ 
            success: false,
            message: 'GitHub authentication failed. Please try again.' 
        });
    }
    
    res.redirect(clientUrl);
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token', {
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    }).redirect(clientUrl);
});

module.exports = router;