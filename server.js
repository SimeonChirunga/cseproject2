//require('dotenv').config();
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

// Database connection 
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// ===== MIDDLEWARE SETUP ===== //


// Parsers 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// CORS (before session/auth)
app.use(cors({
  origin: [
    'http://localhost:3000',       
    'https://cseproject2.onrender.com' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With'
  ]
}));


app.options('/auth/*', cors()); // Only for auth routes
app.options('/api/*', cors());  // Only for API routes

//Session (before passport)
app.use(session({
  secret: process.env.SESSION_SECRET || "/FVP37nPYRgSDHeTD6zfcWDNLNobWDF1O6SgVh/4SWjL8mbhOcezuDQJjqjqwfj1uka+rdHHMRoAQB3XKncNTQ",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    domain: '.onrender.com',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
}));

//  Passport (after session)
app.use(passport.initialize());
app.use(passport.session());

// ===== ROUTES ===== //
app.use('/', mainRoutes); // Main routes 
app.use('/auth', authRoutes); // Authentication routes





// ===== ERROR HANDLING ===== //
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Error!!!! this route does not exist: ${req.method} ${req.originalUrl}` 
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error('Error!!!!: ', err.stack);
  
  const statusCode = err.status || 500;
  const errorResponse = {
    success: false,
    message: err.message || 'Something went wrong',
  };

  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.fullError = err;
  }

  res.status(statusCode).json(errorResponse);
});


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
});



