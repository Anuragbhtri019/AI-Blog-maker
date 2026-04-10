import cron from 'node-cron';
import { Blog } from '../models/Blog.js';
import { Comment } from '../models/Comment.js';

let isOldBlogCleanupRunning = false;

/**
 * Delete blogs older than 1 month and their associated comments
 * Runs daily at 02:00 UTC
 */
export const scheduleOldBlogsDeletion = () => {
  cron.schedule('0 2 * * *', () => {
    console.log('\n🗑️ Running scheduled cleanup for old blogs...');
    runOldBlogsCleanup('daily schedule at 02:00 UTC');
  });

  console.log('✓ Old blogs deletion scheduled for 02:00 UTC daily');

  // Run cleanup in background when server starts (non-blocking)
  setImmediate(() => {
    runOldBlogsCleanup('startup cleanup check (background)');
  });
};

/**
 * Delete blogs older than 1 month
 */
const deleteOldBlogs = async () => {
  try {
    // Calculate date from 1 month ago (30 days)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    // Find blogs older than 1 month
    const oldBlogs = await Blog.find({
      createdAt: { $lt: oneMonthAgo },
    }).select('_id title image createdAt');

    if (oldBlogs.length === 0) {
      console.log('✓ No old blogs found to delete');
      return;
    }

    console.log(`📋 Found ${oldBlogs.length} blog(s) older than 1 month`);

    // Get IDs for bulk deletion
    const blogIds = oldBlogs.map(blog => blog._id);

    // Delete all comments associated with these blogs
    const commentsDeleted = await Comment.deleteMany({
      blog: { $in: blogIds },
    });

    console.log(`✓ Deleted ${commentsDeleted.deletedCount} associated comments`);

    // Delete the blogs
    const result = await Blog.deleteMany({
      _id: { $in: blogIds },
    });

    // Log details of deleted blogs
    oldBlogs.forEach(blog => {
      const daysOld = Math.floor((new Date() - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24));
      console.log(`  - Deleted: "${blog.title}" (${daysOld} days old)`);
    });

    console.log(`✓ Successfully deleted ${result.deletedCount} old blog(s) and images`);
  } catch (error) {
    console.error('❌ Error in old blogs deletion:', error.message);
  }
};

export const runOldBlogsCleanup = async reason => {
  if (isOldBlogCleanupRunning) {
    console.log('⏳ Old blog cleanup skipped: previous run still in progress');
    return;
  }

  isOldBlogCleanupRunning = true;

  try {
    if (reason) {
      console.log(`\n🔁 Old blog cleanup trigger: ${reason}`);
    }
    await deleteOldBlogs();
  } finally {
    isOldBlogCleanupRunning = false;
  }
};

/**
 * Manual trigger for testing
 */
export const manualBlogsCleanup = async () => {
  try {
    await runOldBlogsCleanup('manual trigger');
  } catch (error) {
    console.error('Error in manual cleanup:', error.message);
  }
};
