/**
 * Seed script to manually generate test blogs
 * Run this once: node server/scripts/seedBlogs.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB, disconnectDB } from '../src/config/db.js';
import { runAutoBlogGeneration } from '../src/cron/autoBlogGenerator.js';

const seedBlogs = async () => {
  try {
    console.log('🌱 Starting blog seeding...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔑 GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✓ Set' : '✗ Missing');
    console.log(
      '🖼️  UNSPLASH_ACCESS_KEY:',
      process.env.UNSPLASH_ACCESS_KEY ? '✓ Set' : '✗ Missing'
    );

    // Connect to database
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Generate initial blogs
    console.log('\n🚀 Generating initial blogs...');
    await runAutoBlogGeneration('manual seed script');

    console.log('\n✅ Blog seeding completed!');
    console.log('📝 Check your /api/blogs endpoint to see the generated blogs');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

seedBlogs();
