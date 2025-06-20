# Azure Setup Guide for MovieSwipe Backend

This guide will help you deploy your MovieSwipe backend to Azure using **fully automated CI/CD** - no local setup required!

## 🚀 Quick Start (CI/CD Only)

### Option 1: GitHub Actions (Recommended)

1. **Fork/Clone** this repository to your GitHub account
2. **Set up Azure credentials** in GitHub Secrets:
   ```bash
   # Generate Azure service principal
   az ad sp create-for-rbac --name "movieswipe-backend" --role contributor \
     --scopes /subscriptions/{subscription-id} \
     --sdk-auth
   ```
3. **Add the JSON output** as `AZURE_CREDENTIALS` secret in GitHub:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add new repository secret: `AZURE_CREDENTIALS`
   - Paste the entire JSON output from the command above

4. **Push to main branch** - deployment starts automatically!

### Option 2: Azure DevOps

1. **Create Azure DevOps project**
2. **Import repository** and pipeline
3. **Configure service connection** in Azure DevOps
4. **Push to main branch** - deployment starts automatically!

## 📋 What Happens Automatically

### 1. **Build Stage**
- ✅ Install Node.js 18
- ✅ Install dependencies
- ✅ Run ESLint
- ✅ Build TypeScript
- ✅ Run tests
- ✅ Publish build artifacts

### 2. **Infrastructure Stage**
- ✅ Create Azure resource group
- ✅ Deploy App Service Plan
- ✅ Deploy App Service
- ✅ Deploy Application Insights

### 3. **Configuration Stage**
- ✅ Set Node.js version
- ✅ Configure environment variables
- ✅ Set up production settings

### 4. **Deployment Stage**
- ✅ Deploy application code
- ✅ Verify deployment
- ✅ Get application URL

## 🔧 Required Setup

### GitHub Actions Setup

1. **Repository Secrets** (Settings → Secrets and variables → Actions):
   ```
   AZURE_CREDENTIALS = {service-principal-json}
   ```

2. **Optional Environment Variables** (can be set later in Azure Portal):
   ```
   MONGODB_URI = your-mongodb-connection-string
   MONGODB_URI_TEST = your-test-mongodb-connection-string
   JWT_SECRET = your-super-secret-jwt-key
   JWT_EXPIRES_IN = 7d
   API_PREFIX = /api/v1
   CORS_ORIGIN = https://your-frontend-domain.com
   ```

### Azure DevOps Setup

1. **Service Connection** (Project Settings → Service connections):
   - Create new Azure Resource Manager connection
   - Use service principal authentication

2. **Pipeline Variables** (Pipelines → Edit → Variables):
   ```
   AZURE_SUBSCRIPTION = Your-Azure-Subscription-Name
   RESOURCE_GROUP = movieswipe-rg
   APP_NAME = movieswipe-backend
   ```

## 🌐 After Deployment

### 1. **Access Your App**
Your app will be available at: `https://movieswipe-backend.azurewebsites.net`

### 2. **Configure Environment Variables**
Go to Azure Portal → App Service → Configuration → Application settings and add:
```
MONGODB_URI=your-mongodb-connection-string
MONGODB_URI_TEST=your-test-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
API_PREFIX=/api/v1
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. **Set up Database**
- **Option A**: Use Azure Cosmos DB (MongoDB API)
- **Option B**: Use external MongoDB service (MongoDB Atlas, etc.)

## 📊 Monitoring

### Application Insights
- **URL**: Azure Portal → Application Insights → movieswipe-backend-ai
- **Features**: Performance monitoring, error tracking, usage analytics

### Logs
- **Stream logs**: Azure Portal → App Service → Log stream
- **Download logs**: Azure Portal → App Service → Logs

## 🔄 Continuous Deployment

### Automatic Triggers
- **Push to main**: Triggers full deployment
- **Pull Request**: Runs build and tests only

### Manual Triggers
- **GitHub Actions**: Go to Actions tab → Run workflow
- **Azure DevOps**: Go to Pipelines → Run pipeline

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Deployment Failures**
   - Verify Azure credentials are correct
   - Check resource group permissions
   - Ensure app name is unique

3. **Runtime Errors**
   - Check application logs in Azure Portal
   - Verify environment variables are set
   - Check database connectivity

### Getting Help

- **GitHub Actions**: Check Actions tab for detailed logs
- **Azure DevOps**: Check Pipelines for detailed logs
- **Azure Portal**: Check App Service logs and Application Insights

## 💰 Cost Optimization

### Development
- **SKU**: B1 (Basic) - ~$13/month
- **Auto-scaling**: Disabled
- **Monitoring**: Basic

### Production
- **SKU**: S1 (Standard) - ~$73/month
- **Auto-scaling**: Enabled
- **Monitoring**: Full Application Insights

## 🔒 Security

### HTTPS/SSL
- ✅ Free SSL certificate included
- ✅ HTTPS enforced by default

### Environment Variables
- ✅ Stored securely in Azure App Service
- ✅ Can be encrypted with Azure Key Vault

### Network Security
- ✅ Azure App Service built-in security
- ✅ Can add IP restrictions if needed

## 🎯 Next Steps

1. **Set up custom domain** (optional)
2. **Configure SSL certificate** (optional)
3. **Set up monitoring alerts**
4. **Configure auto-scaling rules**
5. **Set up staging environment**

---

**🎉 That's it!** Your MovieSwipe backend will be automatically deployed to Azure every time you push to the main branch. No local setup required! 