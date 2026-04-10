/**
 * Environment configuration validator and manager
 * Validates all required environment variables and provides type-safe access
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load the server-level .env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'PORT',
  'CLIENT_URL',
  'GROQ_API_KEY',
  'UNSPLASH_ACCESS_KEY',
  'NODE_ENV'
];

const optionalEnvVars = [
  'NEWSAPI_KEY',
  'IMAGE_STORAGE_PROVIDER',
  'ADMIN_EMAILS',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'AWS_S3_REGION',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

/**
 * Validate environment variables
 */
export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('✗ Missing required environment variables:');
    missing.forEach(var_ => console.error(`  - ${var_}`));
    console.error('Please check your .env file or environment configuration.');
    process.exit(1);
  }

  // Validate specific values
  const validations = [
    {
      key: 'JWT_SECRET',
      validator: (value) => value.length >= 32,
      message: 'JWT_SECRET should be at least 32 characters long for security'
    },
    {
      key: 'NODE_ENV',
      validator: (value) => ['development', 'production', 'test'].includes(value),
      message: 'NODE_ENV must be one of: development, production, test'
    },
    {
      key: 'PORT',
      validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) < 65536,
      message: 'PORT must be a valid port number (1-65535)'
    },
    {
      key: 'CLIENT_URL',
      validator: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'CLIENT_URL must be a valid URL'
    },
    {
      key: 'MONGO_URI',
      validator: (value) => value.startsWith('mongodb'),
      message: 'MONGO_URI must be a valid MongoDB connection string'
    }
  ];

  for (const { key, validator, message } of validations) {
    const value = process.env[key];
    if (value && !validator(value)) {
      console.warn(`⚠️  Warning: ${message}`);
      warnings.push(`${key}: ${message}`);
    }
  }

  // Warn about development defaults in production
  if (process.env.NODE_ENV === 'production') {
    const productionWarnings = [
      {
        key: 'JWT_SECRET',
        check: (value) => value.includes('change-in-production'),
        message: 'Using default JWT_SECRET in production!'
      },
      {
        key: 'MONGO_URI',
        check: (value) => value.includes('password'),
        message: 'MONGO_URI contains default credentials!'
      }
    ];

    for (const { key, check, message } of productionWarnings) {
      const value = process.env[key];
      if (value && check(value)) {
        console.error(`🚨 SECURITY WARNING: ${message}`);
        warnings.push(`SECURITY: ${key} - ${message}`);
      }
    }
  }

  console.log('✓ Environment validation completed');
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s) found`);
  }

  return { valid: true, warnings };
};

/**
 * Get typed environment configuration
 */
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL,

  // Database
  mongoUri: process.env.MONGO_URI,

  // Security
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '24h',
  refreshTokenExpiresIn: '7d',

  // API Keys
  groqApiKey: process.env.GROQ_API_KEY,
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
  newsApiKey: process.env.NEWSAPI_KEY,

  // Image Storage
  imageStorage: {
    provider: process.env.IMAGE_STORAGE_PROVIDER || 'local',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION || 'us-east-1'
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    }
  },

  // Admin configuration
  adminEmails: process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase())
    : ['system@vibeblog.ai'],

  // Feature flags
  features: {
    autoBlogGeneration: process.env.NODE_ENV !== 'test',
    rateLimiting: process.env.NODE_ENV === 'production',
    logging: process.env.NODE_ENV !== 'test'
  },

  // Performance settings
  database: {
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2'),
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
    serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000')
  }
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = () => config.nodeEnv === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = () => config.nodeEnv === 'production';

/**
 * Check if we're in test mode
 */
export const isTest = () => config.nodeEnv === 'test';

/**
 * Get configuration for specific environment
 */
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = config;

  for (const k of keys) {
    value = value?.[k];
  }

  return value;
};
