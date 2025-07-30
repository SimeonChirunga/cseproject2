const router = require('express').Router();
const passport = require('passport');
const { generateToken } = require('../middleware/authenticate');

// GitHub OAuth Login
router.get('/github', passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
}));

// GitHub OAuth Callback
router.get('/github/callback', 
    passport.authenticate('github', { 
        failureRedirect: '/login',
        session: false 
    }),
    (req, res) => {
        try {
            const token = generateToken({
                id: req.user._id,
                displayName: req.user.displayName,
                email: req.user.email
            });
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600000
            });
            
            res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
        } catch (error) {
            console.error('Auth callback error:', error);
            res.redirect('/login?error=auth_failed');
        }
    }
);

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

module.exports = router;