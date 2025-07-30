const router = require('express').Router();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json'); 

// Serve Swagger UI documentation
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// API Routes
router.use('/api', require('./api'));

// Homepage
router.get('/', (req, res) => {
  
  const isAuthenticated = req.isAuthenticated() || (req.cookies && req.cookies.token);
  
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
            ? '<a href="/auth/github">Login with GitHub</a>' 
            : '<a href="https://cseproject2.onrender.com/auth/github">Logout</a>'
          }
          <a href="/api-docs">API Documentation</a>
          <a href="/api/items">View Items</a>
          <a href="/api/categories">View Categories</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;