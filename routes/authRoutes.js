const router = require('express').Router();
const passport = require('passport');
const { generateToken } = require('../middleware/authenticate');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = isProduction 
  ? process.env.CLIENT_URL || 'https://your-frontend.onrender.com'
  : 'http://localhost:3000';
const loginErrorUrl = `${clientUrl}/login?error=auth_failed`;

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to GitHub for authentication
 */
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'],
  session: false,
  failureRedirect: loginErrorUrl
}));

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       302:
 *         description: Redirect on failure
 *       401:
 *         description: Authentication failed
 */
router.get('/github/callback', 
  passport.authenticate('github', { 
    session: false, 
    failureRedirect: loginErrorUrl 
  }), 
  (req, res) => {
    const token = generateToken(req.user);
    const userData = {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      avatar: req.user.avatar
    };

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.onrender.com' : undefined,
      maxAge: 3600000 // 1 hour
    });
    
    // Development-friendly response
    if (!isProduction) {
      return res.json({
        success: true,
        token,
        user: userData,
        cookie: `Set for domain: ${isProduction ? '.onrender.com' : 'localhost'}`,
        redirect: `${clientUrl}/dashboard`
      });
    }

    // Production response
    res.redirect(`${clientUrl}/dashboard`);
  }
);

/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: Login error handler
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Login page
 *       401:
 *         description: Authentication error
 */
router.get('/login', (req, res) => {
  const { error } = req.query;
  
  if (error === 'auth_failed') {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed',
      ...(!isProduction && {
        debug: 'GitHub OAuth returned an error',
        solution: 'Check your GitHub OAuth configuration'
      })
    });
  }
  
  res.redirect(clientUrl);
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to home after clearing session
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.onrender.com' : undefined
  });

  if (!isProduction) {
    return res.json({
      success: true,
      message: 'Token cookie cleared',
      redirect: clientUrl
    });
  }

  res.redirect(clientUrl);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         displayName:
 *           type: string
 *         avatar:
 *           type: string
 */
module.exports = router;