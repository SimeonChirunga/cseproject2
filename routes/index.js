const router = require('express').Router();

// API Routes
router.use('/api', require('./api'));

// API Documentation
router.use('/', require('./swagger'));



// Homepage
router.get('/', (req, res) => {
  res.send(`
    <h1>Inventory API</h1>
    <p>Welcome to the Inventory Management System</p>
    <ul>
      <li><a href="/api-docs">API Documentation</a></li>
      <li><a href="/api/categories">View Categories</a></li>
      <li><a href="/api/items">View Items</a></li>
    </ul>
  `);
});

module.exports = router;