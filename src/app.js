const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const productRoutes = require('./routes/product.routes');
const swaggerDocument = require('./docs/swagger');

const app = express();

app.use(cors({
  origin: ['http://localhost:3001', 'https://ui-products-bxgrc3h8dbdtabbq.brazilsouth-01.azurewebsites.net']
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api-docs-json', (req, res) => {
  res.status(200).json(swaggerDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({ message: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
