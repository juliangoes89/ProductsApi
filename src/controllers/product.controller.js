const productService = require('../services/product.service');

async function getAll(req, res) {
  const products = await productService.getAllProducts();
  return res.status(200).json(products);
}

async function getById(req, res) {
  const id = Number(req.params.id);
  const product = await productService.getProductById(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json(product);
}

async function create(req, res) {
  try {
    const newProduct = await productService.createProduct(req.body);
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);

  try {
    const updatedProduct = await productService.updateProduct(id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = await productService.deleteProduct(id);

  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(204).send();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
