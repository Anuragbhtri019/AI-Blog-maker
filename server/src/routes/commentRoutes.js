import express from 'express';
import {
  createComment,
  getComments,
  getCommentsByBlog,
  deleteComment,
  updateComment,
} from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateComment, sanitizeHtml } from '../middleware/validation.js';
import { commentLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

/**
 * Comment routes
 */

// Generic route - get comments for a blog
router.get('/', getComments);

// Legacy route - get comments for a blog (backward compatibility)
router.get('/blog/:blogId', getCommentsByBlog);

// Protected routes - require authentication
router.post('/', authMiddleware, commentLimiter, validateComment, sanitizeHtml, createComment);
router.put('/:commentId', authMiddleware, commentLimiter, validateComment, sanitizeHtml, updateComment);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
