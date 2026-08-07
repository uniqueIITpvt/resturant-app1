const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

/**
 * Configure Swagger middleware for Express
 * @param {object} app - Express app instance
 */
const setupSwagger = (app) => {
  // Load the main OpenAPI specification
  const swaggerDocument = YAML.load(
    path.resolve(__dirname, '../docs/swagger/swagger.yaml')
  );

  // Directory containing route YAML files
  const swaggerDir = path.resolve(__dirname, '../docs/swagger');

  // Get all route YAML files
  const routeFiles = fs
    .readdirSync(swaggerDir)
    .filter(
      (file) =>
        file !== 'swagger.yaml' &&
        file !== 'schemas.yaml' &&
        file.endsWith('.yaml')
    );

  // Create paths object if it doesn't exist
  if (!swaggerDocument.paths) {
    swaggerDocument.paths = {};
  }

  // Add components object if it doesn't exist
  if (!swaggerDocument.components) {
    swaggerDocument.components = {};
  }

  // Add schemas object if it doesn't exist
  if (!swaggerDocument.components.schemas) {
    swaggerDocument.components.schemas = {};
  }

  // Merge paths and schemas from all route files
  routeFiles.forEach((file) => {
    try {
      const routeDoc = YAML.load(path.join(swaggerDir, file));

      // Add paths from route file
      if (routeDoc.paths) {
        Object.assign(swaggerDocument.paths, routeDoc.paths);
      }

      // Add schemas from route file if they exist
      if (routeDoc.components && routeDoc.components.schemas) {
        Object.assign(
          swaggerDocument.components.schemas,
          routeDoc.components.schemas
        );
      }
    } catch (err) {
      console.error(`Error loading route file ${file}:`, err);
    }
  });

  // Swagger UI
  app.use(
    '/swagger',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Restaurant Business API Documentation',
    })
  );

  // Serve swagger docs in JSON format
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  console.log('Swagger documentation available at localhost:5000/swagger');
};

module.exports = { setupSwagger };
