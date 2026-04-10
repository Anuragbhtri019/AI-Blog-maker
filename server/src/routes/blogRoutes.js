import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getUserBlogs,
  updateBlog,
  deleteBlog,
  getTrendingBlogs,
  triggerAutoBlogGeneration,
} from '../controllers/blogController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { upload, processImage } from '../middleware/upload.js';
import { validateBlog, sanitizeHtml } from '../middleware/validation.js';
import { adminLimiter, uploadLimiter, blogCreationLimiter } from '../middleware/rateLimiting.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = express.Router();

/**
 * Blog routes
 */

// Must come BEFORE /:id to avoid route collision
router.get('/trending', cacheMiddleware(300), getTrendingBlogs); // Cache trending blogs for 5 minutes
router.get('/user/me', authMiddleware, getUserBlogs);
router.post(
  '/admin/trigger-auto-generation',
  authMiddleware,
  adminLimiter,
  triggerAutoBlogGeneration
);

// Public routes with optional auth
router.get('/', optionalAuthMiddleware, cacheMiddleware(180), getAllBlogs); // Cache blog list for 3 minutes (but respect auth status)
router.get('/:id', cacheMiddleware(600), getBlogById); // Cache individual blog for 10 minutes

// Protected routes
router.post(
  '/',
  authMiddleware,
  blogCreationLimiter,
  upload.single('image'),
  uploadLimiter,
  processImage,
  validateBlog,
  sanitizeHtml,
  createBlog
);
router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  uploadLimiter,
  processImage,
  validateBlog,
  sanitizeHtml,
  updateBlog
);
router.delete('/:id', authMiddleware, deleteBlog);

export default router;
