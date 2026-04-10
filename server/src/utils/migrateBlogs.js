import mongoose from 'mongoose';
import { Blog } from '../models/Blog.js';
import logger from './logger.js';

/**
 * Slug generation helper function
 */
const generateSlug = text => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .slice(0, 50); // Limit length
};

/**
 * Migrate existing blogs without slugs
 */
export const migrateBlogs = async () => {
  try {
    const blogsWithoutSlug = await Blog.find({ slug: { $exists: false } })
      .select('_id title')
      .lean();

    if (blogsWithoutSlug.length === 0) {
      logger.info('All blogs already have slugs');
      return;
    }

    logger.info(`Migrating ${blogsWithoutSlug.length} blogs without slugs`);

    let migratedCount = 0;

    for (const blog of blogsWithoutSlug) {
      let slug = generateSlug(blog.title);
      let uniqueSlug = slug;
      let counter = 1;

      // Ensure slug is unique
      while (await Blog.findOne({ slug: uniqueSlug, _id: { $ne: blog._id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      // Use updateOne to avoid triggering pre-save hook
      await Blog.updateOne({ _id: blog._id }, { $set: { slug: uniqueSlug } });

      logger.info(`Generated slug for blog: ${blog.title} -> ${uniqueSlug}`);
      migratedCount++;
    }

    logger.info(`Migration complete: ${migratedCount} blogs updated`);
  } catch (error) {
    logger.error('Blog migration failed', { error: error.message });
    throw error;
  }
};
