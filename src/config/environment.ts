import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  MONGODB_URI_TEST: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRATION: string;
  GOOGLE_CLIENT_ID: string;
  TMDB_API_KEY: string;
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
  ACCESS_TOKEN_SECRET: getEnvVariable('ACCESS_TOKEN_SECRET'),
  ACCESS_TOKEN_EXPIRATION: getEnvVariable('ACCESS_TOKEN_EXPIRATION'),
  REFRESH_TOKEN_SECRET: getEnvVariable('REFRESH_TOKEN_SECRET'),
  REFRESH_TOKEN_EXPIRATION: getEnvVariable('REFRESH_TOKEN_EXPIRATION'),
  GOOGLE_CLIENT_ID: getEnvVariable('GOOGLE_CLIENT_ID'),
  TMDB_API_KEY: getEnvVariable('TMDB_API_KEY'),
};

export default config;