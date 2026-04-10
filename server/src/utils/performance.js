import logger from './logger.js';

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();

  // Track memory usage
  const startMemory = process.memoryUsage();

  // Override res.end to calculate performance metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    const endMemory = process.memoryUsage();

    // Calculate memory diff
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    };

    // Log performance metrics for slow requests
    if (duration > 1000) { // Log if request takes more than 1 second
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        memoryDiff: {
          rss: `${(memoryDiff.rss / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        },
      });
    }

    // Add performance headers for development
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
      res.setHeader('X-Memory-Usage', `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }

    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Database query performance helper
 */
export class QueryOptimizer {
  /**
   * Add efficient pagination
   */
  static paginate(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  /**
   * Add projection to reduce data transfer
   */
  static selectFields(query, fields) {
    if (fields && typeof fields === 'string') {
      return query.select(fields);
    }
    return query;
  }

  /**
   * Add lean() for read-only operations
   */
  static lean(query) {
    return query.lean();
  }

  /**
   * Add appropriate indexes suggestion logging
   */
  static logQueryPerformance(model, query, duration) {
    if (duration > 100) { // Log slow queries (>100ms)
      logger.warn('Slow database query detected', {
        model: model.modelName,
        query: JSON.stringify(query.getQuery()),
        duration: `${duration}ms`,
        suggestion: 'Consider adding database indexes for this query pattern'
      });
    }
  }
}

/**
 * Memory cleanup helper
 */
export const memoryCleanup = () => {
  if (global.gc) {
    global.gc();
    logger.debug('Manual garbage collection triggered');
  }

  const usage = process.memoryUsage();
  logger.info('Memory usage', {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)}MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`,
  });
};

/**
 * Graceful shutdown helper
 */
export const gracefulShutdown = (server) => {
  const signals = ['SIGTERM', 'SIGINT'];

  signals.forEach(signal => {
    process.on(signal, () => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      server.close(() => {
        logger.info('HTTP server closed');

        // Close database connections
        if (global.mongoose && global.mongoose.connection) {
          global.mongoose.connection.close(() => {
            logger.info('Database connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30s timeout');
        process.exit(1);
      }, 30000);
    });
  });
};