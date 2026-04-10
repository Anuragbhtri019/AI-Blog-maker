import logger from '../utils/logger.js';

/**
 * HTTP request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log the incoming request
  logger.http(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ...(req.userId && { userId: req.userId }),
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;

    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      ...(req.userId && { userId: req.userId }),
    });

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};