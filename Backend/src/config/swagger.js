const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Management Portal API',
      version: '1.0.0',
      description:
        'REST API for a college Software Engineering project. Manages users, projects, tasks and comments with role-based authorization (ADMIN, PROJECT_MANAGER, TEAM_MEMBER).',
    },
    servers: [
      {
        url: '/api',
        description: 'Base API path',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Paths are relative to project root, this file lives in src/config
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
