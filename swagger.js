const swaggerAutogen = require('swagger-autogen')();

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction
  ? process.env.BASE_URL || 'https://your-app-name.onrender.com'
  : `http://localhost:${process.env.PORT || 5000}`;

// API Documentation Configuration
const doc = {
  info: {
    title: 'Inventory API',
    version: '1.0.0',
    description: `API for managing inventory (${isProduction ? 'Production' : 'Development'})`
  },
  servers: [
    {
      url: baseUrl,
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
    Category: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Electronics' },
        description: { type: 'string', example: 'All electronic devices' }
      }
    },
    Item: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Laptop' },
        price: { type: 'number', example: 999.99 },
        category: { type: 'string', example: '64d21b4667d0d8992e610c85' }
      }
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/*.js'];

// Generate documentation
if (!isProduction || process.env.GENERATE_SWAGGER === 'true') {
  swaggerAutogen(outputFile, endpointsFiles, doc)
    .then(() => console.log('Swagger docs generated successfully'))
    .catch(err => console.error('Swagger generation failed:', err));
}

module.exports = doc;