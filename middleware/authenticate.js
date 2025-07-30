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
  // Check both cookies and Authorization header
  const token = req.cookies?.token || 
               req.headers?.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  generateToken,
  isAuthenticated
};