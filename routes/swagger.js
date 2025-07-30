const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Environment config
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction 
  ? process.env.BASE_URL || 'https://your-app.onrender.com' 
  : 'http://localhost:5000';

// Minimal Swagger UI options (no custom CSS)
const options = {
  customSiteTitle: isProduction 
    ? "Inventory API Docs" 
    : "DEV - Inventory API Docs",
  swaggerOptions: {
    docExpansion: 'none',       // Collapse all operations by default
    defaultModelsExpandDepth: -1, // Hide schemas
    filter: true,              // Enable search
    persistAuthorization: true  // Save auth tokens
  }
};

// Inject environment info into Swagger doc
swaggerDocument.info.description = [
  swaggerDocument.info.description,
  `\n\n**Environment**: ${isProduction ? 'Production' : 'Development'}`,
  `**Base URL**: ${BASE_URL}`
].join('\n');

// Serve Swagger UI
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument, options));

module.exports = router;