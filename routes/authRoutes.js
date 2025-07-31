const router = require('express').Router();
const passport = require('passport');
const { generateToken, handleCallback, logout } = require('../middleware/authenticate');
const { isProduction } = require('../config/env');

// Environment configuration
const clientUrl = isProduction 
  ? process.env.CLIENT_URL || 'https://cseproject2.onrender.com'
  : 'http://localhost:3000';

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
 *       500:
 *         description: Server error
 */
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'],
  session: false
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
 *         description: Redirect to client with token
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.get('/github/callback', 
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${clientUrl}/login?error=auth_failed`
  }),
  handleCallback
);

/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: Login status endpoint
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Login information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Authentication error
 */
router.get('/login', (req, res) => {
  const { error } = req.query;
  
  if (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed',
      error: error === 'auth_failed' ? 'GitHub authentication failed' : error,
      authUrl: '/auth/github'
    });
  }
  
  res.json({
    authenticated: false,
    message: 'Visit /auth/github to authenticate',
    authUrl: '/auth/github'
  });
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       302:
 *         description: Redirect to client after logout
 */
router.get('/logout', logout);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify authentication status
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/verify', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      authenticated: false,
      message: 'Not authenticated' 
    });
  }
  
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName
    }
  });
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
 *           format: objectid
 *           example: 507f1f77bcf86cd799439011
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         displayName:
 *           type: string
 *           example: John Doe
 *         githubId:
 *           type: string
 *           example: 123456789
 *         avatar:
 *           type: string
 *           format: uri
 *           example: https://avatars.githubusercontent.com/u/123456789
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
module.exports = router;