import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Abstract storage interface for different providers
 */
class ImageStorage {
  constructor() {
    this.provider = process.env.IMAGE_STORAGE_PROVIDER || 'local';
    this.uploadDir = path.join(__dirname, '../../uploads');
  }

  /**
   * Initialize storage (create directories, etc.)
   */
  async initialize() {
    if (this.provider === 'local') {
      try {
        await fs.access(this.uploadDir);
      } catch {
        await fs.mkdir(this.uploadDir, { recursive: true });
        logger.info('Created uploads directory');
      }
    }
  }

  /**
   * Store image and return URL
   */
  async store(imageBuffer, originalName) {
    const filename = this.generateFilename(originalName);

    switch (this.provider) {
      case 'local':
        return await this.storeLocal(imageBuffer, filename);
      case 's3':
        return await this.storeS3(imageBuffer, filename);
      case 'cloudinary':
        return await this.storeCloudinary(imageBuffer, filename);
      default:
        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }
  }

  /**
   * Delete image by URL/key
   */
  async delete(imageUrl) {
    switch (this.provider) {
      case 'local':
        return await this.deleteLocal(imageUrl);
      case 's3':
        return await this.deleteS3(imageUrl);
      case 'cloudinary':
        return await this.deleteCloudinary(imageUrl);
      default:
        logger.warn(`Delete not implemented for provider: ${this.provider}`);
    }
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(originalName) || '.webp';
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Store image locally
   */
  async storeLocal(imageBuffer, filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.writeFile(filePath, imageBuffer);

      // Return URL path (to be served by Express static middleware)
      return `/uploads/${filename}`;
    } catch (error) {
      logger.error('Failed to store image locally', { error: error.message });
      throw new Error('Image storage failed');
    }
  }

  /**
   * Delete local image
   */
  async deleteLocal(imageUrl) {
    try {
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const filename = path.basename(imageUrl);
        const filePath = path.join(this.uploadDir, filename);
        await fs.unlink(filePath);
        logger.info('Deleted local image', { filename });
      }
    } catch (error) {
      logger.warn('Failed to delete local image', {
        imageUrl,
        error: error.message
      });
    }
  }

  /**
   * Store image in AWS S3 (placeholder for future implementation)
   */
  async storeS3(imageBuffer, filename) {
    // TODO: Implement S3 storage
    // const s3Upload = await s3Client.upload({
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: `images/${filename}`,
    //   Body: imageBuffer,
    //   ContentType: 'image/webp',
    //   ACL: 'public-read'
    // }).promise();
    // return s3Upload.Location;

    throw new Error('S3 storage not yet implemented');
  }

  /**
   * Store image in Cloudinary (placeholder for future implementation)
   */
  async storeCloudinary(imageBuffer, filename) {
    // TODO: Implement Cloudinary storage
    // const result = await cloudinary.uploader.upload_stream({
    //   resource_type: 'image',
    //   public_id: `blogs/${path.parse(filename).name}`,
    //   format: 'webp',
    //   transformation: [
    //     { quality: 'auto', fetch_format: 'auto' }
    //   ]
    // }, imageBuffer);
    // return result.secure_url;

    throw new Error('Cloudinary storage not yet implemented');
  }

  async deleteS3(imageUrl) {
    // TODO: Implement S3 deletion
    throw new Error('S3 deletion not yet implemented');
  }

  async deleteCloudinary(imageUrl) {
    // TODO: Implement Cloudinary deletion
    throw new Error('Cloudinary deletion not yet implemented');
  }
}

// Export singleton instance
export const imageStorage = new ImageStorage();