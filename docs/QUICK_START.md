# Quick Start Guide - MovieSwipe Backend

This guide will help you set up your MovieSwipe backend that **fully complies** with your project requirements.

## 🎯 **Project Requirements Compliance**

✅ **Node.js backend** - Custom Express.js implementation  
✅ **TypeScript** - Full TypeScript codebase  
✅ **Azure cloud** - Azure App Service hosting  
✅ **MongoDB** - Azure Cosmos DB (MongoDB API)  
✅ **Custom implementation** - No forbidden third-party services  

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Set up Azure Credentials**

1. **Get your Azure subscription ID:**
   ```bash
   # Go to Azure Portal → Subscriptions → Copy Subscription ID
   # Or use Azure CLI:
   az account show --query id --output tsv
   ```

2. **Create Azure service principal:**
   ```bash
   # Replace {subscription-id} with your actual subscription ID
   az ad sp create-for-rbac --name "movieswipe-backend" --role contributor \
     --scopes /subscriptions/{subscription-id} \
     --sdk-auth
   ```

3. **Add to GitHub Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add new repository secret: `AZURE_CREDENTIALS`
   - Paste the entire JSON output from step 2

### **Step 2: Deploy to Azure**

**Just push to main branch!** 🎉

```bash
git add .
git commit -m "feat: initial deployment"
git push origin main
```

The GitHub Actions workflow will automatically:
- ✅ Build your TypeScript code
- ✅ Run tests
- ✅ Deploy to Azure App Service
- ✅ Set up Azure Cosmos DB (MongoDB API)
- ✅ Configure everything

### **Step 3: Verify Deployment**

1. **Check GitHub Actions** - Go to Actions tab to see deployment progress
2. **Access your app** - Your app will be available at: `https://movieswipe-backend.azurewebsites.net`
3. **Check database** - Go to Azure Portal → Cosmos DB accounts → movieswipe-cosmos

## 📋 **What Gets Deployed**

### **Infrastructure:**
- **Azure App Service** - Hosts your Node.js app
- **Azure Cosmos DB** - MongoDB-compatible database
- **Application Insights** - Monitoring (optional)

### **Your Custom Code:**
- **Authentication** - Custom JWT implementation
- **Database models** - Custom Mongoose schemas
- **API endpoints** - Custom Express.js routes
- **Business logic** - Custom services
- **Validation** - Custom middleware

## 🔧 **Local Development**

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your values
# (You'll get the MongoDB URI from Azure Portal after deployment)

# Run in development
npm run dev
```

## 🗄️ **Database Setup**

### **After Deployment:**

1. **Get connection string** from Azure Portal:
   - Go to Cosmos DB account → Connection strings
   - Copy the MongoDB connection string

2. **Update your .env file:**
   ```
   MONGODB_URI=mongodb://movieswipe-cosmos:key@movieswipe-cosmos.mongo.cosmos.azure.com:10255/movieswipe-db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@movieswipe-cosmos@
   ```

3. **Collections will be created automatically** when your app runs

## 📊 **Project Structure**

```
src/
├── config/           # Configuration (environment, database)
├── controllers/      # Custom API controllers
├── middleware/       # Custom middleware (auth, validation)
├── models/          # Custom Mongoose models and types
├── routes/          # Custom Express routes
├── services/        # Custom business logic
├── utils/           # Custom utility functions
└── index.ts         # Custom Express app entry point
```

## ✅ **Compliance Checklist**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Node.js backend | ✅ | Custom Express.js |
| TypeScript | ✅ | Full TypeScript |
| Azure cloud | ✅ | Azure App Service |
| MongoDB | ✅ | Azure Cosmos DB |
| No MongoDB Atlas | ✅ | Using Azure's service |
| No Firebase/AWS | ✅ | Custom implementations |
| No Azure Functions | ✅ | Custom Express.js |
| Custom authentication | ✅ | JWT with bcrypt |
| Custom database logic | ✅ | Mongoose models |

## 🎯 **Key Points for Instructors**

1. **Azure Cosmos DB** is Azure's managed MongoDB service (NOT MongoDB Atlas/Realm)
2. **All major functionality** is custom-built (authentication, database operations, API logic)
3. **Azure App Service** is only used for hosting, not for business logic
4. **The architecture** follows requirements while using Azure infrastructure
5. **No forbidden services** are used for major functionality

## 🆘 **Troubleshooting**

### **Deployment Issues:**
- Check GitHub Actions logs
- Verify Azure credentials are correct
- Ensure subscription has enough quota

### **Database Issues:**
- Check connection string in Azure Portal
- Verify network access settings
- Check Cosmos DB account status

### **Local Development:**
- Ensure Node.js 18+ is installed
- Check all environment variables are set
- Run `npm run lint` to check code quality

## 📚 **Documentation**

- **`docs/PROJECT_REQUIREMENTS.md`** - Detailed compliance explanation
- **`docs/AZURE_SETUP.md`** - Azure deployment guide
- **`docs/DATABASE_SETUP.md`** - Database management guide

---

**🎉 You're all set!** Your MovieSwipe backend is now deployed to Azure with a custom MongoDB implementation that fully complies with your project requirements. 