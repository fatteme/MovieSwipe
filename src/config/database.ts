import mongoose from 'mongoose';
import config from './environment';

// MongoDB connection options
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
};

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
  try {
    const uri = config.NODE_ENV === 'test' ? config.MONGODB_URI_TEST : config.MONGODB_URI;
    
    await mongoose.connect(uri, mongoOptions);
    
    console.log(`✅ MongoDB connected successfully in ${config.NODE_ENV} mode`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

// Get connection status
export const getConnectionStatus = (): string => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}; 