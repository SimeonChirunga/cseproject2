const router = require('express').Router();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction 
  ? process.env.BASE_URL || 'https://cseproject2.onrender.com'
  : 'http://localhost:5000';
const CLIENT_URL = isProduction
  ? process.env.CLIENT_URL || 'https://your-frontend.onrender.com'
  : 'http://localhost:3000';

// Serve Swagger UI documentation
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// API Routes
router.use('/api', require('./api'));

// Homepage
router.get('/', (req, res) => {
  const isAuthenticated = req.isAuthenticated() || (req.cookies && req.cookies.token);
  
  // Environment-aware URLs
  const loginUrl = `${BASE_URL}/auth/github`;
  const logoutUrl = `${BASE_URL}/auth/logout`;
  const apiDocsUrl = `${BASE_URL}/api-docs`;
  const itemsUrl = `${BASE_URL}/api/items`;
  const categoriesUrl = `${BASE_URL}/api/categories`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Inventory API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .links {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        a {
          display: inline-block;
          padding: 10px 15px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        a:hover {
          background: #2980b9;
        }
        .status {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
          background: ${isAuthenticated ? '#d4edda' : '#f8d7da'};
          color: ${isAuthenticated ? '#155724' : '#721c24'};
        }
        footer {
          margin-top: 30px;
          font-size: 0.8em;
          color: #666;
          text-align: center;
        }
      </style>
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

        <footer>
          ${isProduction 
            ? 'Production Environment' 
            : 'Development Environment - ' + 
              `<a href="${CLIENT_URL}" target="_blank">Frontend</a> | ` +
              `<a href="${BASE_URL}/api-docs" target="_blank">API Docs</a>`
          }
        </footer>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;