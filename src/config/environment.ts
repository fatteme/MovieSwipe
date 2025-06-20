import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  MONGODB_URI_TEST: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
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
  GOOGLE_CLIENT_ID: getEnvVariable('GOOGLE_CLIENT_ID'),
};

export default config;