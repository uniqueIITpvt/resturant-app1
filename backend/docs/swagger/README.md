# Swagger Documentation for Restaurant Business API

This document outlines how the Swagger/OpenAPI documentation is organized for the Restaurant Business API.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Configuration](#configuration)
4. [Adding New Routes](#adding-new-routes)
5. [Schemas](#schemas)
6. [Best Practices](#best-practices)

## Overview

We use OpenAPI 3.0 specification (Swagger) to document our API. The documentation is modular, with separate YAML files for different parts of the API, which are then merged at runtime to create the complete documentation.

Access the API documentation at: `/api-docs`

## Directory Structure

```
backend/docs/swagger/
├── swagger.yaml            # Main OpenAPI configuration
├── schemas.yaml            # Shared schema definitions
├── auth.routes.yaml        # Authentication endpoints
├── category.routes.yaml    # Category management
├── coupon.routes.yaml      # Coupon management
├── email.routes.yaml       # Email sending operations
├── eventOffer.routes.yaml  # Event/Offer management
├── order.routes.yaml       # Order management
├── product.routes.yaml     # Product management
├── upload.routes.yaml      # File upload operations
└── user.routes.yaml        # User management
```

## Configuration

The Swagger documentation is initialized in `utils/swagger.js`, which:

1. Loads the main `swagger.yaml` file
2. Finds all other `*.routes.yaml` files in the swagger directory
3. Merges their paths and schema definitions
4. Sets up the Swagger UI at the `/api-docs` endpoint

```javascript
// Example from utils/swagger.js
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

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
        if (!swaggerDocument.components) {
          swaggerDocument.components = {};
        }
        if (!swaggerDocument.components.schemas) {
          swaggerDocument.components.schemas = {};
        }
        Object.assign(
          swaggerDocument.components.schemas,
          routeDoc.components.schemas
        );
      }
    } catch (err) {
      console.error(`Error loading route file ${file}:`, err);
    }
  });

  // Mount Swagger UI middleware
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Restaurant Business API Documentation',
    })
  );
};
```

## Adding New Routes

To document a new set of API endpoints:

1. Create a new YAML file in the `docs/swagger` directory with a name like `feature.routes.yaml`
2. Start with tags definition:

```yaml
tags:
  - name: FeatureName
    description: Description of the feature

paths:
  /api/feature:
    get:
      summary: Get all items
      tags: [FeatureName]
      responses:
        200:
          description: List of items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/YourModel'
```

3. Document each endpoint with:

   - HTTP method (GET, POST, PUT, DELETE, etc.)
   - Summary and description
   - Request parameters (path, query, header)
   - Request body for POST/PUT
   - Response codes and schemas
   - Security requirements for protected endpoints

4. If needed, add new schema definitions in the `components.schemas` section

## Schemas

Common data models are defined in `schemas.yaml` and can be referenced in route files using `$ref: '#/components/schemas/ModelName'`.

Route-specific models can be defined within each route file. For example:

```yaml
components:
  schemas:
    FeatureModel:
      type: object
      required:
        - name
      properties:
        _id:
          type: string
          description: Unique identifier
        name:
          type: string
          description: Feature name
        createdAt:
          type: string
          format: date-time
```

## Best Practices

1. **Consistency**: Use consistent naming and descriptions across your documentation.
2. **Detail Level**: Include enough detail for developers to understand each endpoint.
3. **Examples**: When helpful, include example responses:

```yaml
responses:
  200:
    description: Success
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/YourModel'
        example:
          id: '5f8d0d55b54764421b715fb3'
          name: 'Example name'
          createdAt: '2023-01-01T12:00:00Z'
```

4. **Security**: Mark protected endpoints with security requirements:

```yaml
security:
  - BearerAuth: []
```

5. **Validation**: Document validation requirements and error responses.
6. **Parameters**: Be thorough with parameter descriptions:

```yaml
parameters:
  - in: path
    name: id
    required: true
    schema:
      type: string
    description: The unique identifier of the resource
```

7. **Maintenance**: Update documentation when you change the API.

---

By following these guidelines, we maintain comprehensive and accurate API documentation that helps developers understand and use our API effectively.
