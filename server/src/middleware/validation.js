import { body, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      errors: errors.array(),
      body: req.body,
      ip: req.ip,
    });
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * User registration validation
 */
export const validateRegister = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

/**
 * User login validation
 */
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Blog creation validation
 */
export const validateBlog = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
  body('content')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long')
    .trim(),
  body('category')
    .isIn(['Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment', 'General'])
    .withMessage('Please select a valid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  handleValidationErrors,
];

/**
 * Comment validation
 */
export const validateComment = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim(),
  handleValidationErrors,
];

/**
 * Message validation
 */
export const validateMessage = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('subject')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
    .trim(),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .trim(),
  handleValidationErrors,
];

/**
 * Sanitize HTML content to prevent XSS
 */
export const sanitizeHtml = (req, res, next) => {
  if (req.body.content) {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    req.body.content = req.body.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  next();
};
