import rateLimit from 'express-rate-limit';

/**
 * IP whitelist for admin operations
 */
const adminWhitelist = [
  '127.0.0.1',
  '::1',
  // Add production admin IPs here
];

/**
 * Admin rate limiter - very strict
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 admin operations per 15 minutes
  message: 'Too many admin operations, please try again later.',
  skip: (req) => {
    // Skip rate limiting for whitelisted IPs in development
    if (process.env.NODE_ENV === 'development') {
      return adminWhitelist.includes(req.ip);
    }
    return false;
  },
});

/**
 * Upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many upload attempts, please try again later.',
});

/**
 * Comment rate limiter
 */
export const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 comments per 5 minutes
  message: 'Too many comments, please wait before commenting again.',
});

/**
 * Message rate limiter
 */
export const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 messages per 15 minutes
  message: 'Too many messages sent, please try again later.',
});

/**
 * Blog creation rate limiter
 */
export const blogCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 blogs per hour
  message: 'Too many blog posts created, please try again later.',
});