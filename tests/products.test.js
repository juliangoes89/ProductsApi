const fs = require('fs/promises');
const path = require('path');
const request = require('supertest');

const testDbFile = path.join(__dirname, 'tmp', 'products.test.json');
process.env.PRODUCT_DB_FILE = testDbFile;

process.env.COSMOS_CONNECTION_STRING =
  'AccountEndpoint=https://localhost:443/;AccountKey=fakeKeyForTests=;';
process.env.COSMOS_DATABASE_ID = 'ProductsDb';
process.env.COSMOS_CONTAINER_ID = 'products';

jest.mock('@azure/cosmos', () => {
  const store = new Map();

  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const container = {
    items: {
      query: (querySpec) => ({
        fetchAll: async () => {
          const query = querySpec?.query || '';

          if (query.includes('MAX(c.productId)')) {
            const max = [...store.values()].reduce(
              (acc, item) => Math.max(acc, Number(item.productId || 0)),
              0
            );
            return { resources: [max] };
          }

          const resources = [...store.values()].sort(
            (a, b) => Number(a.productId) - Number(b.productId)
          );
          return { resources: clone(resources) };
        },
      }),
      create: async (doc) => {
        store.set(String(doc.id), clone(doc));
        return { resource: clone(doc) };
      },
      upsert: async (doc) => {
        store.set(String(doc.id), clone(doc));
        return { resource: clone(doc) };
      },
    },
    item: (id) => ({
      read: async () => {
        const found = store.get(String(id));
        if (!found) {
          const err = new Error('Not found');
          err.code = 404;
          throw err;
        }
        return { resource: clone(found) };
      },
      delete: async () => {
        if (!store.has(String(id))) {
          const err = new Error('Not found');
          err.code = 404;
          throw err;
        }
        store.delete(String(id));
        return {};
      },
    }),
  };

  class CosmosClient {
    constructor() {
      this.databases = {
        createIfNotExists: async () => ({
          database: {
            containers: {
              createIfNotExists: async () => ({ container }),
            },
          },
        }),
      };
    }
  }

  return {
    CosmosClient,
    __mock: {
      reset: () => store.clear(),
    },
  };
});

const { __mock } = require('@azure/cosmos');
const app = require('../src/app');

describe('Products API (Cosmos mocked, offline)', () => {
  beforeEach(() => {
    __mock.reset();
  });

  it('GET /api/products should return empty array initially', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/products should create a product', async () => {
    const payload = {
      name: 'Keyboard',
      description: 'Mechanical keyboard',
      price: 49.99,
      stock: 10,
    };

    const res = await request(app).post('/api/products').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(res.body.id).toBe(1);
  });

  it('GET /api/products/:id should return the product', async () => {
    const createRes = await request(app).post('/api/products').send({
      name: 'Mouse',
      description: 'Wireless mouse',
      price: 19.99,
      stock: 25,
    });

    const id = createRes.body.id;
    const res = await request(app).get(`/api/products/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('Mouse');
  });

  it('PUT /api/products/:id should update the product', async () => {
    const createRes = await request(app).post('/api/products').send({
      name: 'Monitor',
      description: '24 inch',
      price: 149.99,
      stock: 5,
    });

    const id = createRes.body.id;

    const updateRes = await request(app).put(`/api/products/${id}`).send({
      name: 'Monitor',
      description: '27 inch',
      price: 179.99,
      stock: 7,
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({
      id,
      name: 'Monitor',
      description: '27 inch',
      price: 179.99,
      stock: 7,
    });
  });

  it('DELETE /api/products/:id should delete the product', async () => {
    const createRes = await request(app).post('/api/products').send({
      name: 'Headset',
      description: 'Noise cancelling',
      price: 89.99,
      stock: 8,
    });

    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/products/${id}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/products/${id}`);
    expect(getRes.status).toBe(404);
  });
});
