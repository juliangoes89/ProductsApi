# Azure App Service Deployment

This API is prepared for deployment to Azure App Service on the Windows F1 free tier.

## Prerequisites

- Azure subscription
- Existing Azure Cosmos DB account
- App Service extension in VS Code or Azure Portal access

## Required App Settings

Set these values in App Service > Environment variables:

- `COSMOS_CONNECTION_STRING`
- `COSMOS_DATABASE_ID=ProductsDb`
- `COSMOS_CONTAINER_ID=products`
- `NODE_ENV=production`
- `API_BASE_URL=https://<app-name>.azurewebsites.net`
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- `WEBSITE_NODE_DEFAULT_VERSION=~24`

## Create the App Service

1. In Azure Portal, create a new Web App.
2. Choose `Code` as the publish type.
3. Choose `Node 24 LTS` as the runtime stack.
4. Choose `Windows` as the operating system.
5. Choose `Free F1` as the pricing plan.

## Publish from VS Code

1. Sign in to Azure in VS Code.
2. Open the Azure extension.
3. Under App Services, create or select your app.
4. Deploy the current workspace.
5. Confirm deployment when prompted.

## Verify the deployment

- `GET https://<app-name>.azurewebsites.net/health`
- `GET https://<app-name>.azurewebsites.net/api-docs`
- `GET https://<app-name>.azurewebsites.net/api-docs-json`
- Test CRUD at `https://<app-name>.azurewebsites.net/api/products`

## Notes

- App Service can run on the free tier, but Azure Cosmos DB is billed separately.
- Swagger uses `API_BASE_URL` when provided and falls back to the Azure hostname automatically on App Service.
- The app already listens on `process.env.PORT`, which App Service requires.
