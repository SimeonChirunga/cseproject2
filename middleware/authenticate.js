const jwt = require('jsonwebtoken');

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
      iat: Math.floor(Date.now() / 1000) // issued at
    },
    process.env.JWT_SECRET,
    JWT_CONFIG
  );
};

const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token || 
               req.headers?.authorization?.split(' ')[1] || 
               req.query?.token;

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    req.user = {
      id: decoded.id,
      displayName: decoded.displayName,
      email: decoded.email
    };

    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' 
      ? 'Session expired. Please login again.'
      : 'Invalid authentication token';

    res.status(401).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    });
  }
};

module.exports = {
  generateToken,
  isAuthenticated
};