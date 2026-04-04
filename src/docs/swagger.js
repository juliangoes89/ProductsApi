const serverUrl = process.env.API_BASE_URL
  || (process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : 'http://localhost:3000');

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Products API',
    version: '1.0.0',
    description: 'CRUD API for products',
  },
  servers: [
    {
      url: serverUrl,
      description: process.env.WEBSITE_HOSTNAME ? 'Azure App Service' : 'Local server',
    },
  ],
  tags: [
    {
      name: 'Products',
      description: 'Products management endpoints',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        responses: {
          200: {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created product',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorMessage',
                },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          200: {
            description: 'Product found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorMessage',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated product',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorMessage',
                },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorMessage',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          204: {
            description: 'Product deleted',
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorMessage',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Keyboard',
          },
          description: {
            type: 'string',
            example: 'Mechanical keyboard',
          },
          price: {
            type: 'number',
            example: 120,
          },
          stock: {
            type: 'integer',
            example: 10,
          },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'price', 'stock'],
        properties: {
          name: {
            type: 'string',
            example: 'Keyboard',
          },
          description: {
            type: 'string',
            example: 'Mechanical keyboard',
          },
          price: {
            type: 'number',
            example: 120,
          },
          stock: {
            type: 'integer',
            example: 10,
          },
        },
      },
      ErrorMessage: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Product not found',
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
