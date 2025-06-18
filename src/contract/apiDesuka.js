const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Desuka API',
      version: '1.0.0',
      description: 'Documentación de la API de Desuka',
    },
  },
  apis: ['./src/routes/*.js'], // Ajusta la ruta según donde estén tus rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;