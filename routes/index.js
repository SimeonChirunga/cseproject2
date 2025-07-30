const router = require('express').Router();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Get base URL from environment (set in Render.com dashboard)
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Serve Swagger UI documentation
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// API Routes
router.use('/api', require('./api'));

// Homepage
router.get('/', (req, res) => {
  const isAuthenticated = req.isAuthenticated() || (req.cookies && req.cookies.token);
  
  // Use BASE_URL for all links
  const loginUrl = `${BASE_URL}/auth/github`;
  const logoutUrl = `${BASE_URL}/auth/logout`; // You should implement this
  const apiDocsUrl = `${BASE_URL}/api-docs`;
  const itemsUrl = `${BASE_URL}/api/items`;
  const categoriesUrl = `${BASE_URL}/api/categories`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <!-- ... your existing head content ... -->
    </head>
    <body>
      <div class="container">
        <h1>Welcome to the Inventory API</h1>
        
        <div class="status">
          ${isAuthenticated 
            ? 'You are logged in! Manage your inventory below.' 
            : 'Please log in to manage the inventory system.'
          }
        </div>
        
        <div class="links">
          ${!isAuthenticated 
            ? `<a href="${loginUrl}">Login with GitHub</a>` 
            : `<a href="${logoutUrl}">Logout</a>`
          }
          <a href="${apiDocsUrl}">API Documentation</a>
          <a href="${itemsUrl}">View Items</a>
          <a href="${categoriesUrl}">View Categories</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;