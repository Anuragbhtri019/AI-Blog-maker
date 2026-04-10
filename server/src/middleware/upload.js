import multer from 'multer';
import sharp from 'sharp';
import { imageStorage } from '../utils/imageStorage.js';
import logger from '../utils/logger.js';

/**
 * Multer storage configuration (memory)
 */
const storage = multer.memoryStorage();

/**
 * File filter - accept only images
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

/**
 * Multer upload middleware
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Middleware to process and store single image
 * Used for blog creation/update (single featured image)
 */
export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Initialize storage if needed
    await imageStorage.initialize();

    // Resize and compress to WebP
    let imageBuffer = await sharp(req.file.buffer)
      .resize(1200, 640, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Check file size and compress more if needed
    if (imageBuffer.length > 100 * 1024) {
      logger.info('Image too large, applying additional compression', {
        originalSize: imageBuffer.length,
        filename: req.file.originalname,
      });

      imageBuffer = await sharp(imageBuffer)
        .resize(800, 420, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 75 })
        .toBuffer();
    }

    // Store image and get URL
    const imageUrl = await imageStorage.store(imageBuffer, req.file.originalname);

    // Attach image URL to request for use in controllers
    req.imageUrl = imageUrl;
    req.imageSize = imageBuffer.length;

    logger.info('Image processed and stored successfully', {
      filename: req.file.originalname,
      finalSize: imageBuffer.length,
      url: imageUrl,
    });

    next();
  } catch (error) {
    logger.error('Image processing failed', {
      error: error.message,
      filename: req.file?.originalname,
    });
    res.status(400).json({ message: 'Image processing failed', error: error.message });
  }
};

/**
 * Middleware to process and store multiple images
 * [DEPRECATED - Not used in v1. The blog system supports single featured images only.
 *  Multiple images and reordering was attempted for vlogs but removed as the platform
 *  focuses on text blogs with single featured images. Users manage content in CreateBlogPage.
 *  Kept for future reference if multi-image support is needed.]
 */
export const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    // Initialize storage if needed
    await imageStorage.initialize();

    const imageUrls = [];

    for (const file of req.files) {
      // Resize and compress to WebP
      let imageBuffer = await sharp(file.buffer)
        .resize(1200, 640, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 85 })
        .toBuffer();

      // Check file size and compress more if needed
      if (imageBuffer.length > 100 * 1024) {
        logger.info('Image too large, applying additional compression', {
          originalSize: imageBuffer.length,
          filename: file.originalname,
        });

        imageBuffer = await sharp(imageBuffer)
          .resize(800, 420, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 75 })
          .toBuffer();
      }

      // Store image and get URL
      const imageUrl = await imageStorage.store(imageBuffer, file.originalname);
      imageUrls.push(imageUrl);

      logger.info('Image processed and stored successfully', {
        filename: file.originalname,
        finalSize: imageBuffer.length,
        url: imageUrl,
      });
    }

    // Attach image URLs to request for use in controllers
    req.imageUrls = imageUrls;
    req.featuredImageUrl = imageUrls[0] || null; // First image as featured

    next();
  } catch (error) {
    logger.error('Image processing failed', {
      error: error.message,
      fileCount: req.files?.length,
    });
    res.status(400).json({ message: 'Image processing failed', error: error.message });
  }
};
