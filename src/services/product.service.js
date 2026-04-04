const productDb = require('../database/product.database');

function validateProductInput(data) {
  const { name, description = '', price, stock } = data;

  if (!name || typeof name !== 'string') {
    throw new Error('name is required and must be a string');
  }

  if (typeof description !== 'string') {
    throw new Error('description must be a string');
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error('price is required and must be a number >= 0');
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('stock is required and must be an integer >= 0');
  }
}

async function getAllProducts() {
  return productDb.findAll();
}

async function getProductById(id) {
  return productDb.findById(id);
}

async function createProduct(data) {
  validateProductInput(data);
  return productDb.create(data);
}

async function updateProduct(id, data) {
  validateProductInput(data);
  return productDb.update(id, data);
}

async function deleteProduct(id) {
  return productDb.remove(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
