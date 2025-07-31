require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
const docsRoutes = require('./routes/swagger');

// Initialize Express
const app = express();

// Environment config
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = process.env.BASE_URL || 
  (isProduction ? 'https://cseproject2.onrender.com' : 'http://localhost:5000');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: isProduction ? BASE_URL : 'http://localhost:3000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Production settings
if (isProduction) {
  app.set('trust proxy', 1);
  
  // Basic security headers without Helmet
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
}

// Routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/api-docs', docsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: isProduction ? 'Server error' : err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  Server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}
  ➡️  Base URL: ${BASE_URL}
  📅 Started: ${new Date().toLocaleString()}
  `);
});