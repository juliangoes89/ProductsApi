# Products API

Node.js CRUD API for products using a layered architecture:

- Controllers
- Services
- Database

## Requirements

- Node.js 18+

## Install

```bash
npm install
```

Copy `.env.example` to `.env` for local configuration when running against Azure Cosmos DB.

## Run

```bash
npm run dev
```

or

```bash
npm start
```

## Tests

```bash
npm test
```

## API Documentation (Swagger)

- UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs-json`

## Azure Deployment

See `DEPLOYMENT.md` for Azure App Service Windows F1 deployment steps and required application settings.

## Endpoints

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

## Product body example

```json
{
  "name": "Keyboard",
  "description": "Mechanical keyboard",
  "price": 120,
  "stock": 10
}
```

## Add this to environment variables when running locally

```powershell
$env:COSMOS_CONNECTION_STRING="AccountEndpoint=...;AccountKey=...;"
$env:COSMOS_DATABASE_ID="ProductsDb"
$env:COSMOS_CONTAINER_ID="products"
npm run dev
```
