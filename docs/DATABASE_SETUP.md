# Database Management in Azure

This guide covers how to manage your MovieSwipe database in Azure using Cosmos DB with MongoDB API.

## 🗄️ **Database Options**

### **1. Azure Cosmos DB (MongoDB API) - Recommended**

**Why Cosmos DB?**
- ✅ **Fully managed** - No server maintenance
- ✅ **MongoDB compatible** - Works with your existing Mongoose code
- ✅ **Global distribution** - Can be deployed worldwide
- ✅ **Auto-scaling** - Scales automatically with your app
- ✅ **Built-in security** - Encryption, networking, compliance
- ✅ **Cost effective** - Pay for what you use

### **2. Azure Database for PostgreSQL**
- Relational database option
- Better for complex queries and relationships
- ACID compliance

### **3. External MongoDB (MongoDB Atlas)**
- Keep using MongoDB externally
- No code changes needed
- Global clusters

## 🚀 **Cosmos DB Setup (Automated)**

Your Azure deployment now includes Cosmos DB automatically! The infrastructure template creates:

- **Cosmos DB Account** with MongoDB API
- **Database** named `movieswipe-db`
- **Connection string** automatically configured in your app

### **What's Created:**

1. **Cosmos DB Account**: `movieswipe-cosmos`
2. **Database**: `movieswipe-db`
3. **Collections**: Will be created automatically when your app runs
4. **Connection String**: Automatically set in App Service configuration

## 📊 **Database Management**

### **View Your Database**

1. **Azure Portal**:
   - Go to Azure Portal → Cosmos DB accounts
   - Click on `movieswipe-cosmos`
   - Go to "Data Explorer"
   - Browse your `movieswipe-db` database

2. **MongoDB Compass** (Desktop App):
   - Download MongoDB Compass
   - Use the connection string from Azure Portal
   - Connect and browse your data

### **Connection String**

Your connection string is automatically configured, but you can find it in:

**Azure Portal**:
1. Go to Cosmos DB account
2. Click "Connection strings"
3. Copy the MongoDB connection string

**Format**:
```
mongodb://movieswipe-cosmos:key@movieswipe-cosmos.mongo.cosmos.azure.com:10255/movieswipe-db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@movieswipe-cosmos@
```

## 🔧 **Database Operations**

### **Create Collections**

Collections are created automatically when your Mongoose models run, but you can also create them manually:

**Via Azure Portal**:
1. Go to Data Explorer
2. Click "New Collection"
3. Enter collection name (e.g., `users`, `movies`)
4. Set partition key (e.g., `_id`)

**Via MongoDB Compass**:
1. Connect to your database
2. Click "Create Collection"
3. Enter collection name and options

### **Import/Export Data**

**Export Data**:
```bash
# Export from local MongoDB
mongoexport --db movieswipe --collection users --out users.json

# Import to Cosmos DB (via MongoDB Compass or Azure Portal)
```

**Import Data**:
```bash
# Import to Cosmos DB
mongoimport --uri "your-cosmos-connection-string" --db movieswipe-db --collection users --file users.json
```

## 📈 **Scaling & Performance**

### **Throughput (RU/s)**

**Current Setup**: 400 RU/s (shared across database)
**Scaling Options**:
- **Autoscale**: Automatically scales based on usage
- **Manual**: Set specific RU/s values
- **Per Collection**: Dedicated throughput per collection

### **Scaling Commands**

```bash
# Update throughput for database
az cosmosdb mongodb database throughput update \
  --account-name movieswipe-cosmos \
  --resource-group movieswipe-rg \
  --name movieswipe-db \
  --throughput 1000

# Enable autoscale
az cosmosdb mongodb database throughput update \
  --account-name movieswipe-cosmos \
  --resource-group movieswipe-rg \
  --name movieswipe-db \
  --max-throughput 4000
```

## 🔒 **Security**

### **Network Security**

**Firewall Rules**:
1. Go to Cosmos DB account → "Networking"
2. Add IP addresses or ranges
3. Enable "Allow access from Azure portal"

**Private Endpoints**:
- Connect via private network
- Enhanced security for production

### **Access Control**

**Keys**:
- Primary/Secondary keys for connection
- Read-only keys for analytics

**Azure AD Integration**:
- Use Azure AD for authentication
- More secure than connection strings

## 💰 **Cost Optimization**

### **Pricing Model**

**Request Units (RU)**:
- 1 RU = 1KB read or 1KB write
- Pay per request
- Autoscale saves money

### **Cost Optimization Tips**

1. **Use Autoscale**: Automatically scales down during low usage
2. **Optimize Queries**: Use indexes and efficient queries
3. **Batch Operations**: Group multiple operations
4. **Choose Right Consistency**: Session consistency is cost-effective

### **Estimated Costs**

**Development**:
- 400 RU/s shared = ~$24/month
- Autoscale enabled = ~$12-24/month

**Production**:
- 1000 RU/s = ~$60/month
- Autoscale 1000-4000 RU/s = ~$60-240/month

## 🛠️ **Monitoring**

### **Metrics to Watch**

1. **Request Units**: Monitor RU consumption
2. **Data Usage**: Track storage growth
3. **Latency**: Response times
4. **Availability**: Uptime percentage

### **Alerts**

Set up alerts for:
- High RU consumption
- Low availability
- High latency
- Storage approaching limits

## 🔄 **Backup & Recovery**

### **Automatic Backups**

Cosmos DB provides:
- **Continuous backups**: Point-in-time recovery
- **Periodic backups**: Daily backups
- **Geo-redundant**: Multiple regions

### **Manual Backups**

```bash
# Export data
mongoexport --uri "connection-string" --db movieswipe-db --collection users --out backup.json

# Restore data
mongoimport --uri "connection-string" --db movieswipe-db --collection users --file backup.json
```

## 🎯 **Next Steps**

1. **Deploy your app** - Database will be created automatically
2. **Test connections** - Verify your app can connect
3. **Import data** - If you have existing data
4. **Set up monitoring** - Configure alerts
5. **Optimize performance** - Add indexes as needed

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Connection Failures**:
   - Check connection string
   - Verify network access
   - Check firewall rules

2. **Performance Issues**:
   - Monitor RU consumption
   - Add indexes
   - Optimize queries

3. **Cost Issues**:
   - Enable autoscale
   - Review query patterns
   - Optimize data models

### **Getting Help**

- **Azure Portal**: Built-in diagnostics
- **MongoDB Compass**: Visual debugging
- **Azure Support**: Technical support
- **Documentation**: [Cosmos DB Docs](https://docs.microsoft.com/en-us/azure/cosmos-db/)

---

**🎉 Your database is now fully managed in Azure!** No more server maintenance, automatic scaling, and enterprise-grade security. 