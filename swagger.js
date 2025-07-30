const swaggerAutogen = require('swagger-autogen')();

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction
  ? process.env.BASE_URL || 'https://your-app-name.onrender.com'
  : 'http://localhost:5000';

const doc = {
  info: {
    title: 'Inventory API',
    version: '1.0.0',
    description: `API for managing inventory (${isProduction ? 'Production' : 'Development'})`,
  },
  servers: [
    {
      url: `${baseUrl}/api`,
      description: isProduction ? 'Production server' : 'Local development server'
    }
  ],
  schemes: isProduction ? ['https'] : ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Categories', description: 'Inventory category operations' },
    { name: 'Items', description: 'Inventory item operations' }
  ],
  definitions: {
    // ... keep your existing definitions ...
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/api.js'];

// Always generate in development, optional in production
if (!isProduction || process.env.GENERATE_SWAGGER === 'true') {
  swaggerAutogen(outputFile, endpointsFiles, doc);
}

module.exports = doc;