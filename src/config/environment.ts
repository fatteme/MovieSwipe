import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Check if .env file exists
const envPath = join(process.cwd(), '.env');
if (!existsSync(envPath)) {
  throw new Error(`❌ .env file not found at ${envPath}. Please create a .env file based on env.example`);
}

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

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};


const config: EnvironmentConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV'),
  PORT: parseInt(getEnvVariable('PORT')),
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  MONGODB_URI_TEST: getEnvVariable('MONGODB_URI_TEST'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN'),
  API_PREFIX: getEnvVariable('API_PREFIX'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN'),
};

export default config;