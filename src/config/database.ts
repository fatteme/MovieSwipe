import mongoose from 'mongoose';
import config from '@config/environment';

export const connectDB = async (): Promise<void> => {
  try {
    const uri = config.NODE_ENV === 'test' ? config.MONGODB_URI_TEST : process.env['COSMOS_DB_CONN_STRING'] || '';

    await mongoose.connect(uri);
    
    console.log(`✅ MongoDB connected successfully in ${config.NODE_ENV} mode`);
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
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

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};
