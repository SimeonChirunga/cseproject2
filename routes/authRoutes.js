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
router.get('/github/callback', 
    passport.authenticate('github', { 
        failureRedirect: loginErrorUrl,
        session: false,
        failureMessage: true // Enable passing error message
    }),
    async (req, res) => {
        try {
            if (!req.user) {
                throw new Error('Authentication failed: No user data');
            }

            const token = generateToken({
                id: req.user._id,
                displayName: req.user.displayName,
                email: req.user.email
            });
            
            // Secure cookie settings for production
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 3600000, // 1 hour
                domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
            });
            
            // Successful authentication redirect
            res.redirect(clientUrl);
        } catch (error) {
            console.error('Auth callback error:', error);
            res.redirect(loginErrorUrl);
        }
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