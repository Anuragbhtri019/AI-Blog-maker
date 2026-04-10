import logger from './logger.js';

/**
 * Environment validation utility
 */
class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate required environment variables
   */
  validateRequired() {
    const required = {
      NODE_ENV: 'Application environment (development, test, production)',
      MONGO_URI: 'Database connection string',
      JWT_SECRET: 'JSON Web Token secret key (minimum 32 characters)',
      CLIENT_URL: 'Frontend application URL for CORS',
    };

    for (const [key, description] of Object.entries(required)) {
      const value = process.env[key];

      if (!value) {
        this.errors.push(`Missing required environment variable: ${key} - ${description}`);
      } else if (key === 'JWT_SECRET' && value.length < 32) {
        this.errors.push(`JWT_SECRET must be at least 32 characters long. Current length: ${value.length}`);
      }
    }
  }

  /**
   * Validate optional but recommended variables
   */
  validateOptional() {
    const optional = {
      GROQ_API_KEY: 'AI content generation will be disabled',
      UNSPLASH_ACCESS_KEY: 'Featured images will use placeholder images',
      NEWSAPI_KEY: 'Trending topics will be limited',
    };

    for (const [key, warning] of Object.entries(optional)) {
      if (!process.env[key]) {
        this.warnings.push(`Optional environment variable missing: ${key} - ${warning}`);
      }
    }
  }

  /**
   * Validate environment-specific configurations
   */
  validateEnvironmentSpecific() {
    const nodeEnv = process.env.NODE_ENV;

    switch (nodeEnv) {
      case 'production':
        this.validateProduction();
        break;
      case 'test':
        this.validateTest();
        break;
      case 'development':
        this.validateDevelopment();
        break;
      default:
        this.warnings.push(`Unknown NODE_ENV: ${nodeEnv}. Expected: development, test, or production`);
    }
  }

  /**
   * Production-specific validations
   */
  validateProduction() {
    // JWT secret should be very strong in production
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 64) {
      this.warnings.push('JWT_SECRET should be at least 64 characters in production for maximum security');
    }

    // Database should use secure connection
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri && !mongoUri.includes('mongodb+srv://') && !mongoUri.includes('ssl=true')) {
      this.warnings.push('Consider using MongoDB Atlas (mongodb+srv://) or SSL connection in production');
    }

    // Client URL should be HTTPS
    const clientUrl = process.env.CLIENT_URL;
    if (clientUrl && !clientUrl.startsWith('https://')) {
      this.warnings.push('CLIENT_URL should use HTTPS in production');
    }

    // Image storage should be cloud-based
    const imageProvider = process.env.IMAGE_STORAGE_PROVIDER;
    if (!imageProvider || imageProvider === 'local') {
      this.warnings.push('Consider using cloud storage (s3 or cloudinary) for images in production');
    }
  }

  /**
   * Test-specific validations
   */
  validateTest() {
    // Test database should be separate
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_TEST;
    if (mongoUri && !mongoUri.includes('test') && !mongoUri.includes('Test')) {
      this.warnings.push('Test database should have "test" in its name to avoid accidental data loss');
    }
  }

  /**
   * Development-specific validations
   */
  validateDevelopment() {
    // Development can be more permissive
    if (!process.env.GROQ_API_KEY) {
      this.warnings.push('GROQ_API_KEY missing - AI blog generation will not work');
    }
  }

  /**
   * Validate and report results
   */
  validate() {
    this.errors = [];
    this.warnings = [];

    this.validateRequired();
    this.validateOptional();
    this.validateEnvironmentSpecific();

    return this.report();
  }

  /**
   * Generate validation report
   */
  report() {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    if (hasErrors) {
      logger.error('Environment validation failed:', {
        errors: this.errors,
        warnings: this.warnings,
      });

      console.error('\n❌ Environment Configuration Errors:');
      this.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      console.error('\nPlease fix these errors before starting the application.\n');

      return false;
    }

    if (hasWarnings) {
      logger.warn('Environment validation warnings:', {
        warnings: this.warnings,
      });

      console.warn('\n⚠️  Environment Configuration Warnings:');
      this.warnings.forEach((warning, index) => {
        console.warn(`  ${index + 1}. ${warning}`);
      });
      console.warn('\n');
    }

    if (!hasErrors && !hasWarnings) {
      logger.info('Environment validation passed');
      console.log('✅ Environment configuration validated successfully');
    }

    return true;
  }

  /**
   * Get configuration summary
   */
  getSummary() {
    return {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 5000,
      database: process.env.MONGO_URI ? 'configured' : 'missing',
      jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing',
      clientUrl: process.env.CLIENT_URL || 'missing',
      imageStorage: process.env.IMAGE_STORAGE_PROVIDER || 'local',
      apiKeys: {
        groq: !!process.env.GROQ_API_KEY,
        unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
        newsapi: !!process.env.NEWSAPI_KEY,
      },
    };
  }
}

// Export singleton instance
export const envValidator = new EnvironmentValidator();