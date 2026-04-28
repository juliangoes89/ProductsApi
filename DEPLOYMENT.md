# Azure App Service Deployment

This API is prepared for deployment to Azure App Service on the Windows F1 free tier.

## Initial Azure Setup

If you don't have the required Azure resources yet, follow these steps to create them:

### 0. Azure CLI Login (Required for CLI commands)

Before running any Azure CLI commands, you must authenticate:

```bash
az login
```

This will open a browser window for you to sign in with your Azure credentials. After successful authentication, the CLI will display your available subscriptions.

If you have multiple subscriptions, set the active one:
```bash
az account list --output table
az account set --subscription "<subscription-id-or-name>"
```

### 1. Create a Resource Group

Using Azure Portal:
1. Sign in to [Azure Portal](https://portal.azure.com)
2. Click **Resource groups** from the home page
3. Click **+ Create**
4. Select your subscription
5. Enter a resource group name (e.g., `crud-products-rg`)
6. Select a region (e.g., `East US`)
7. Click **Review + Create**, then **Create**

Using Azure CLI:
```bash
az group create --name crud-products-rg --location eastus
```

### 2. Create Azure Cosmos DB Account

Using Azure Portal:
1. In Azure Portal, click **+ Create a resource**
2. Search for **Azure Cosmos DB** and select it
3. Click **Create** > **Azure Cosmos DB for NoSQL**
4. Select your subscription and resource group
5. Enter an account name (e.g., `crudproductsdb`)
6. Select a location (same region as your resource group)
7. For **Capacity mode**, select **Serverless** (for development) or **Provisioned throughput**
8. Click **Review + Create**, then **Create**
9. Wait for deployment to complete (5-10 minutes)

Using Azure CLI:
```bash
az cosmosdb create --name crudproductsdb --resource-group crud-products-rg --locations regionName=eastus
```

### 3. Create Database and Container

Using Azure Portal:
1. Navigate to your Cosmos DB account
2. Click **Data Explorer** in the left menu
3. Click **New Database**
4. Enter database ID: `ProductsDb`
5. Click **OK**
6. Click **New Container**
7. Select **Use existing** database: `ProductsDb`
8. Enter container ID: `products`
9. Enter partition key: `/category`
10. Click **OK**

Using Azure CLI:
```bash
az cosmosdb sql database create --account-name crudproductsdb --resource-group crud-products-rg --name ProductsDb
az cosmosdb sql container create --account-name crudproductsdb --resource-group crud-products-rg --database-name ProductsDb --name products --partition-key-path "/category"
```

### 4. Get Cosmos DB Connection String

Using Azure Portal:
1. Navigate to your Cosmos DB account
2. Click **Keys** in the left menu (under Settings)
3. Copy the **PRIMARY CONNECTION STRING**
4. Save it for use in app settings

Using Azure CLI:
```bash
az cosmosdb keys list --name crudproductsdb --resource-group crud-products-rg --type connection-strings --query "connectionStrings[0].connectionString" -o tsv
```

## Prerequisites

- Azure subscription
- Existing Azure Cosmos DB account (see Initial Azure Setup above)
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

## Deployment via Azure CLI

1. Build the app locally: `npm run build`
2. Zip the contents of the `dist` folder.

3. Use Azure CLI to deploy the zip file:

```bash
Set-Location 'c:\EAFIT\Docencia\Proyecto 2\Semana 11\Pruebas Automatizadas\Api'; `
$app='api-products'; `
$rg='crud-products-rg'; `
$connStr='AccountEndpoint=https://crudproductsdb.documents.azure.com:443/;AccountKey=REDACTED;'; `
Compress-Archive -Path '.\src', '.\package.json' -DestinationPath '.\api.zip' -Force; `
az webapp config appsettings set --resource-group $rg --name $app --settings COSMOS_CONNECTION_STRING=$connStr --output none; `
az webapp deploy --resource-group $rg --name $app --src-path '.\api.zip' --type zip; `
az webapp show --resource-group $rg --name $app --query "{name:name, host:defaultHostName, state:state}" -o json
```
