const { CosmosClient } = require('@azure/cosmos');

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseId = process.env.COSMOS_DATABASE_ID || 'ProductsDb';
const containerId = process.env.COSMOS_CONTAINER_ID || 'products';

if (!connectionString) {
  throw new Error('COSMOS_CONNECTION_STRING is required');
}

const client = new CosmosClient(connectionString);
let containerRef = null;

async function getContainer() {
  if (containerRef) return containerRef;

  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ['/id'] },
  });

  containerRef = container;
  return containerRef;
}

function toProduct(doc) {
  return {
    id: doc.productId ?? Number(doc.id),
    name: doc.name,
    description: doc.description || '',
    price: doc.price,
    stock: doc.stock,
  };
}

async function getNextProductId(container) {
  const querySpec = { query: 'SELECT VALUE MAX(c.productId) FROM c' };
  const { resources } = await container.items.query(querySpec).fetchAll();
  const maxId = resources?.[0] || 0;
  return Number(maxId) + 1;
}

async function findAll() {
  const container = await getContainer();
  const querySpec = {
    query: 'SELECT * FROM c ORDER BY c.productId',
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources.map(toProduct);
}

async function findById(id) {
  const container = await getContainer();
  const docId = String(id);

  try {
    const { resource } = await container.item(docId, docId).read();
    return resource ? toProduct(resource) : null;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

async function create(data) {
  const container = await getContainer();
  const productId = await getNextProductId(container);

  const doc = {
    id: String(productId),
    productId,
    name: data.name,
    description: data.description || '',
    price: data.price,
    stock: data.stock,
  };

  const { resource } = await container.items.create(doc);
  return toProduct(resource);
}

async function update(id, data) {
  const container = await getContainer();
  const docId = String(id);

  try {
    const { resource: existing } = await container.item(docId, docId).read();
    if (!existing) return null;

    const updated = {
      ...existing,
      name: data.name,
      description: data.description || '',
      price: data.price,
      stock: data.stock,
    };

    const { resource } = await container.items.upsert(updated);
    return toProduct(resource);
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

async function remove(id) {
  const container = await getContainer();
  const docId = String(id);

  try {
    await container.item(docId, docId).delete();
    return true;
  } catch (error) {
    if (error.code === 404) return false;
    throw error;
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
