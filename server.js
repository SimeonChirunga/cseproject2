require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes');

// Initialize Express app
const app = express();

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = process.env.BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-app-name.onrender.com'  // Default production URL
    : 'http://localhost:5000');             // Default development URL

console.log(`Using BASE_URL: ${BASE_URL}`);  // Debug logging


// Database connection with environment-aware settings
mongoose.connect(
  isProduction 
    ? process.env.MONGODB_URI 
    : process.env.MONGODB_URI || 'mongodb://localhost:27017/project2_dev',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ...(isProduction && {
      retryWrites: true,
      w: 'majority',
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000
    })
  }
)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// ===== MIDDLEWARE SETUP ===== //
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS configuration
app.use(cors({
  origin: isProduction
    ? [process.env.BASE_URL]
    : [
        'http://localhost:3000', // React/Vue dev server
        'http://localhost:5000'  // Local API access
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
}));

// Session configuration with environment-aware settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? new URL(BASE_URL).hostname : undefined,  // Now safe
    maxAge: 24 * 60 * 60 * 1000
  }
}));


// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// ===== PRODUCTION ENHANCEMENTS ===== //
if (isProduction) {
  // Trust proxy headers
  app.set('trust proxy', 1);
  
  // HTTPS enforcement
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// ===== ROUTES ===== //
app.use('/', mainRoutes);
app.use('/auth', authRoutes);

// ===== ERROR HANDLING ===== //
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.origin}${req.originalUrl}`,
    ...(!isProduction && { 
      suggestion: `Try ${BASE_URL}/api-docs for available endpoints` 
    })
  });
});

// Error handler
app.use((err, req, res, next) => {
  if (!err.status) console.error('💥 Server Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: isProduction && err.status !== 401
      ? 'An error occurred'
      : err.message,
    ...(!isProduction && {
      stack: process.env.NODE_ENV !== 'test' ? err.stack : undefined,
      details: err.details
    })
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 Server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode
  🔗 Base URL: ${BASE_URL}
  📄 API Docs: ${BASE_URL}/api-docs
  ⚙️  Environment: ${process.env.NODE_ENV || 'default'}
  `);
});