const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Inventory API Docs",
  swaggerOptions: {
    docExpansion: 'none',
    defaultModelsExpandDepth: -1 // Hide schemas by default
  }
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument, options));

module.exports = router;