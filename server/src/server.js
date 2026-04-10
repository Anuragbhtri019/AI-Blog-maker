import dotenv from 'dotenv';

// Load environment variables FIRST - before any other imports that might use them
dotenv.config();

// Validate environment configuration
import { validateEnv, config } from './config/environment.js';
validateEnv();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB, setupGracefulShutdown } from './config/db.js';
import { errorHandler } from './middleware/error.js';
import { imageStorage } from './utils/imageStorage.js';
import logger from './utils/logger.js';
import { requestLogger, securityHeaders } from './middleware/security.js';
import { performanceMonitor, gracefulShutdown } from './utils/performance.js';
import { envValidator } from './utils/envValidator.js';
import { scheduleAutoBlogGeneration, generateInitialBlogs } from './cron/autoBlogGenerator.js';
import { scheduleOldBlogsDeletion } from './cron/oldBlogsDeletion.js';
import { migrateBlogs } from './utils/migrateBlogs.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

/**
 * Middleware setup
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.clientUrl,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-production-domain.com', // Replace with actual production domain
    ].filter(Boolean); // Remove any undefined values

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Security middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(performanceMonitor);

// Serve static files (uploaded images)
app.use(
  '/uploads',
  express.static('uploads', {
    maxAge: '7d', // Cache images for 7 days
    setHeaders: (res, path) => {
      // Security headers for static files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
    },
  })
);

/**
 * Routes
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: '✓ VibeBlog API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Database connection and server startup
 */
const startServer = async () => {
  try {
    console.log('⏱️  Starting VibeBlog server...');
    const startTime = Date.now();

    // Validate environment configuration
    if (!envValidator.validate()) {
      console.error('Server startup aborted due to environment configuration errors.');
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();

    // Initialize image storage
    await imageStorage.initialize();

    // Migrate existing blogs to add slugs
    console.log('📝 Running blog slug migration...');
    try {
      await migrateBlogs();
      console.log('✓ Blog migration completed\n');
    } catch (error) {
      console.error('⚠ Blog migration error - continuing with server startup');
      console.error(error.message);
    }

    // Setup graceful shutdown handlers
    setupGracefulShutdown();

    // Enable features based on environment - BEFORE starting server
    if (config.features.autoBlogGeneration) {
      // Generate initial blogs on startup (BEFORE server starts listening)
      console.log('\n📚 Generating initial content on startup...');
      try {
        await generateInitialBlogs();
        console.log('✓ Initial content generation completed\n');
      } catch (error) {
        console.error('⚠ Initial content generation failed - continuing with server startup');
        console.error(error.message);
      }

      // Schedule cron jobs for recurring tasks
      scheduleAutoBlogGeneration();
      scheduleOldBlogsDeletion();
      console.log('✓ All scheduled jobs configured\n');
    }

    // Start server (AFTER blog generation completes)
    const server = app.listen(config.port, () => {
      const bootTime = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`🚀 VibeBlog Server started successfully`, {
        port: config.port,
        environment: config.nodeEnv,
        bootTime: `${bootTime}s`,
        urls: {
          api: `http://localhost:${config.port}/api`,
          health: `http://localhost:${config.port}/api/health`,
        },
      });

      console.log(`\n🚀 VibeBlog Server running on http://localhost:${config.port}`);
      console.log(`✓ API: http://localhost:${config.port}/api`);
      console.log(`✓ Health: http://localhost:${config.port}/api/health`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ Server ready in ${bootTime}s\n`);
    });

    return server;
  } catch (error) {
    logger.error('Server startup failed:', {
      error: error.message,
      stack: error.stack,
    });
    console.error('✗ Server startup failed:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📌 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📌 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
