# Environment Configuration Guide

This document outlines the environment configuration for the VibeBlog application, including setup for development, testing, and production environments.

## Environment Files

### `.env` (Development)
Copy from `.env.example` and configure with your development values:

```bash
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/vibeblog_dev
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/vibeblog?retryWrites=true&w=majority

# JWT Configuration - MUST be changed in production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# API Keys (Required for full functionality)
NEWSAPI_KEY=your-newsapi-key-from-newsapi.org
GROQ_API_KEY=your-groq-api-key-from-groq.com
UNSPLASH_ACCESS_KEY=your-unsplash-access-key-from-unsplash.com

# Image Storage Configuration
IMAGE_STORAGE_PROVIDER=local  # Options: local, s3, cloudinary

# Admin Configuration
ADMIN_EMAILS=admin@example.com,superadmin@example.com

# Node Environment
NODE_ENV=development
```

### `.env.test` (Testing)
Used for automated tests:

```bash
NODE_ENV=test
JWT_SECRET=test-super-secret-jwt-key-for-testing-only
MONGO_URI_TEST=mongodb://localhost/vibeblog_test
PORT=5001
CLIENT_URL=http://localhost:3000
# Mock API keys for testing
NEWSAPI_KEY=test-newsapi-key
GROQ_API_KEY=test-groq-api-key
UNSPLASH_ACCESS_KEY=test-unsplash-access-key
IMAGE_STORAGE_PROVIDER=local
ADMIN_EMAILS=admin@test.com
```

### `.env.production` (Production)
Template for production deployment:

```bash
NODE_ENV=production

# Database - Use MongoDB Atlas or dedicated MongoDB server
MONGO_URI=mongodb+srv://prod_user:secure_password@cluster.mongodb.net/vibeblog_prod?retryWrites=true&w=majority

# JWT - Generate strong secret (min 64 characters recommended)
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-for-production-environment

# Server
PORT=5000
CLIENT_URL=https://yourdomain.com

# Production API Keys
NEWSAPI_KEY=prod-newsapi-key
GROQ_API_KEY=prod-groq-api-key
UNSPLASH_ACCESS_KEY=prod-unsplash-access-key

# Image Storage (Recommended: use cloud storage in production)
IMAGE_STORAGE_PROVIDER=s3  # or cloudinary

# AWS S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_S3_REGION=us-east-1

# Cloudinary Configuration (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Configuration
ADMIN_EMAILS=admin@yourdomain.com,superadmin@yourdomain.com

# Security Configuration
TRUST_PROXY=true  # Enable if behind reverse proxy (Nginx, Cloudflare, etc.)
```

## Environment-Specific Configurations

### Development Environment
- Uses local MongoDB or MongoDB Atlas
- Hot reloading with `npm run dev`
- Detailed logging and error messages
- CORS allows localhost origins
- Local image storage

### Testing Environment
- In-memory or separate test database
- Mocked external API calls
- Simplified logging
- Fast test execution
- No file system dependencies

### Production Environment
- Secure JWT secrets (minimum 64 characters)
- Cloud database (MongoDB Atlas)
- Cloud storage for images (S3/Cloudinary)
- Structured logging with log rotation
- Rate limiting and security headers
- Environment-specific CORS origins

## Security Best Practices

### JWT Configuration
- **Development**: Use a secure but readable secret
- **Testing**: Use a predictable test secret
- **Production**: Generate with: `openssl rand -base64 64`

### Database Security
- Use connection string with authentication
- Enable SSL/TLS in production
- Restrict database access by IP
- Regular backups and monitoring

### API Keys
- Store in environment variables, never in code
- Use different keys for different environments
- Rotate keys regularly
- Monitor usage and set limits

### CORS Configuration
- Development: Allow localhost
- Production: Specific domain whitelist
- Never use wildcard (*) in production

## Deployment Configurations

### Vercel (Frontend)
```bash
# Vercel Environment Variables
VITE_API_URL=https://your-api-domain.com/api
```

### Render/Railway (Backend)
- Set environment variables in dashboard
- Enable auto-deploy from GitHub
- Configure health check endpoint: `/api/health`

### Docker Configuration
```dockerfile
# Environment variables can be set in docker-compose.yml
# or injected at runtime
ENV NODE_ENV=production
ENV PORT=5000
```

## Validation and Testing

### Environment Validation
The application validates required environment variables on startup:
- Exits with error if critical variables are missing
- Provides helpful error messages
- Supports optional variables with defaults

### Health Checks
- **Endpoint**: `GET /api/health`
- **Purpose**: Verify application and database connectivity
- **Use**: Load balancers and monitoring tools

## Troubleshooting

### Common Issues
1. **JWT_SECRET too short**: Minimum 32 characters required
2. **Database connection**: Check MONGO_URI format and credentials
3. **CORS errors**: Verify CLIENT_URL matches frontend domain
4. **API key limits**: Monitor usage for external services

### Debug Mode
Enable detailed logging in development:
```bash
NODE_ENV=development
DEBUG=*  # Enable all debug output
```

## Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NODE_ENV` | Yes | development | Application environment |
| `PORT` | No | 5000 | Server port |
| `MONGO_URI` | Yes | - | Database connection |
| `JWT_SECRET` | Yes | - | JWT token signing |
| `CLIENT_URL` | Yes | - | CORS origin |
| `NEWSAPI_KEY` | No | - | News API access |
| `GROQ_API_KEY` | No | - | AI content generation |
| `UNSPLASH_ACCESS_KEY` | No | - | Image fetching |
| `IMAGE_STORAGE_PROVIDER` | No | local | Storage backend |
| `ADMIN_EMAILS` | No | system@vibeblog.ai | Admin user emails |

## Migration Guide

When moving between environments:

1. **Copy appropriate `.env` file**
2. **Update API keys and credentials**
3. **Verify database connectivity**
4. **Test CORS configuration**
5. **Validate image storage setup**
6. **Run health checks**

For additional support, check the main README.md file.