import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  MONGODB_URI_TEST: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  API_PREFIX: string;
  CORS_ORIGIN: string;
}

const config: EnvironmentConfig = {
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3000', 10),
  MONGODB_URI: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/movieswipe',
  MONGODB_URI_TEST: process.env['MONGODB_URI_TEST'] || 'mongodb://localhost:27017/movieswipe_test',
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '7d',
  API_PREFIX: process.env['API_PREFIX'] || '/api/v1',
  CORS_ORIGIN: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
};

export default config; 