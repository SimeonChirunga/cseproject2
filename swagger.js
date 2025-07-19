const swaggerAutogen = require('swagger-autogen')();


 const doc = {
  info: {
    title: 'Inventory API',
    version: '1.0.0',
    description: 'API for managing inventory categories and items',
  },
  host: process.env.SWAGGER_HOST || 'localhost:5000',
  basePath: '/api', // This might not be necessary if you're using servers
  servers: [
    {
      url: '/api',
    },
  ],
  schemes: ['http', 'https'],
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
        name: {
          type: 'string',
          example: 'Electronics',
          description: 'Name of the category'
        },
        description: {
          type: 'string',
          example: 'All electronic devices',
          description: 'Description of the category'
        }
      }
    },
    Item: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Laptop',
          description: 'Name of the item'
        },
        description: {
          type: 'string',
          example: 'High performance laptop',
          description: 'Description of the item'
        },
        price: {
          type: 'number',
          example: 999.99,
          description: 'Price of the item'
        },
        category: {
          type: 'string',
          example: '60d21b4667d0d8992e610c85',
          description: 'ID of the category this item belongs to'
        },
        inStock: {
          type: 'boolean',
          example: true,
          description: 'Availability status of the item'
        }
      }
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/api.js']; // Path to your main route file

// Generate swagger.json
if (process.env.NODE_ENV !== 'production') {
  swaggerAutogen(outputFile, endpointsFiles, doc);
}

module.exports = doc;