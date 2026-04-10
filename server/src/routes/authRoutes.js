import express from 'express';
import { register, login, refreshToken, changePassword, uploadProfileImage } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload, processImage } from '../middleware/upload.js';

const router = express.Router();

/**
 * Auth routes
 */
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

/**
 * Protected routes - require authentication
 */
router.post('/change-password', authMiddleware, changePassword);
router.post('/profile-image', authMiddleware, upload.single('profileImage'), processImage, uploadProfileImage);

export default router;
