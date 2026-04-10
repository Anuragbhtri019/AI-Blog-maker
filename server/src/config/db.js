import mongoose from 'mongoose';
import { config } from './environment.js';
import logger from '../utils/logger.js';

/**
 * MongoDB connection configuration with optimized settings
 */
export const connectDB = async () => {
  try {
    if (typeof config.mongoUri !== 'string' || config.mongoUri.trim().length === 0) {
      throw new Error(
        'MONGO_URI is missing or invalid. Ensure server/.env contains a valid MONGO_URI and restart the server.'
      );
    }

    const conn = await mongoose.connect(config.mongoUri, {
      // Connection pool settings for better performance
      maxPoolSize: config.database.maxPoolSize,
      minPoolSize: config.database.minPoolSize,
      socketTimeoutMS: config.database.socketTimeoutMS,
      serverSelectionTimeoutMS: config.database.serverSelectionTimeoutMS,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`, {
      database: conn.connection.name,
      host: conn.connection.host,
      port: conn.connection.port
    });

    // Log database connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

/**
 * Disconnect MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('MongoDB disconnect error:', error);
    process.exit(1);
  }
};

/**
 * Handle graceful shutdown
 */
export const setupGracefulShutdown = () => {
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    try {
      await disconnectDB();
      logger.info('✓ Database connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
};
