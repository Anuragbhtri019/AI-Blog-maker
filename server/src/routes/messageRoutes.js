import express from 'express';
import {
  sendMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateMessage, sanitizeHtml } from '../middleware/validation.js';
import { messageLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

/**
 * Message routes (all require authentication)
 */

// Protected routes
router.post('/', authMiddleware, messageLimiter, validateMessage, sanitizeHtml, sendMessage);
router.get('/received/all', authMiddleware, getReceivedMessages);
router.get('/sent/all', authMiddleware, getSentMessages);
router.get('/unread/count', authMiddleware, getUnreadCount);
router.put('/:messageId/read', authMiddleware, markMessageAsRead);
router.delete('/:messageId', authMiddleware, deleteMessage);

export default router;
