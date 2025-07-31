const jwt = require('jsonwebtoken');
const passport = require('passport');

// Validate JWT secret on startup
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL ERROR: JWT_SECRET is not configured');
  process.exit(1);
}

const JWT_CONFIG = {
  expiresIn: '1h',
  algorithm: 'HS256'
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }

  if (!user?.id) {
    throw new Error('Invalid user data for token generation');
  }

  return jwt.sign(
    {
      id: user.id,
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      githubId: user.githubId,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    JWT_CONFIG
  );
};

const authenticate = (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: info?.message || 'GitHub authentication failed' 
      });
    }

    const token = generateToken(user);
    
    // Set cookie and send token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    req.user = user;
    next();
  })(req, res, next);
};

const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token || 
               req.headers?.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication token required',
      authUrl: '/auth/github'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      shouldRefresh: true
    });
  }
};

const handleCallback = (req, res) => {
  const token = generateToken(req.user);
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000
  });

  // Redirect or send token based on request type
  if (req.accepts('html')) {
    res.redirect('/');
  } else {
    res.json({ 
      success: true, 
      token,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName
      }
    });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  req.logout();
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  generateToken,
  authenticate,
  isAuthenticated,
  handleCallback,
  logout
};