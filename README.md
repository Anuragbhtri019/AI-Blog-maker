# VibeBlog (AI BLOG )

A production-ready MERN (MongoDB, Express, React, Node.js) blogging platform with AI-powered auto-generated content, featuring SEO-friendly URLs, user profile management, and a beautiful reading experience with complete user management.

**Built with:** React 19 + Vite 8 • Express • Mongoose • JWT Auth • Node-Cron • Groq AI • Sharp Image Processing • URL Slugs
---

## 🌟 Features

### Core Blogging

- **Create & Share Blogs**: Users can create blogs with markdown/HTML content and image uploads
- **Beautiful Feed**: Infinite scroll with category filtering (Technology, Sports, Science, Business, Health, Economy, Environment, Education, General)
- **Single Blog View**: Optimized reading layout with markdown rendering
- **Smart Image Processing**: Automatic WebP compression to <100KB using Sharp

### User Management

- **User Authentication**: Secure registration/login with JWT + bcryptjs
- **User Profile**: View your created blogs with profile header
- **Profile Customization**:
  - Upload and manage profile picture
  - Change password with old password verification
  - View account information (name, email, member since)
- **Active Navigation**: Current page highlighted in navbar (desktop & mobile)

### AI Features

- **AI-Powered Blog Generation**: Automatic daily cron job fetching top headlines from NewsAPI and generating neutral 400-600 word blogs using Groq AI
- **Trending Badges**: AI-generated blogs display importance score and region metadata

### Performance & SEO

- **SEO-Friendly URLs**: Blog URLs use slugs instead of IDs (e.g., `/blog/my-awesome-post` instead of `/blog/507f1f77bcf86cd799439011`)
- **Automatic Slug Generation**: Slugs automatically generated from blog titles with conflict prevention
- **Production Ready**: Deployment-optimized for Vercel (frontend) and Render/Railway (backend)
- **⚡ Optimized Performance**: Fast startup times with lazy loading and background tasks (2-4s server startup)

### Design

- **Dark Mode**: Default dark theme with Tailwind CSS
- **Balanced Gradients**: Strategic, minimal gradients on logos, avatars, and hero sections only
- **Professional Design**: Clean, modern interface focused on content readability
- **State Management**: TanStack Query v5 for data fetching + Zustand for theme/auth state
- **Protected Routes**: Role-based access control with JWT

---

## ⚡ Performance

This project is optimized for fast startup and excellent runtime performance:

- **Server startup**: 2-4 seconds (with background tasks)
- **Client bundle**: ~450 KB (with code splitting)
- **Auto-blog generation**: Runs in background, doesn't block startup
- **Database queries**: Optimized with indexes for sub-100ms response times
- **Lazy-loaded routes**: Faster initial page load
- **Blog slug migration**: Automatic on first startup for existing blogs

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB Atlas (free tier works great)
- API Keys:
  - [NewsAPI.org](https://newsapi.org) - Free tier (100 requests/day)
  - [Groq API](https://groq.com) - Free tier with generous limits
  - [Unsplash API](https://unsplash.com/api) - Free tier

### Local Development

1. **Clone and Install Dependencies**

```bash
git clone <your-repo-url>
cd vibeblog
npm install
cd client && npm install && cd ../server && npm install && cd ..
```

2. **Set Up Environment Variables**

Copy `.env.example` to `.env` at the root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/vibeblog?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-for-production
PORT=5000
CLIENT_URL=http://localhost:5173
NEWSAPI_KEY=your_newsapi_key
GROQ_API_KEY=your_groq_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
NODE_ENV=development
```

3. **Run Development Servers**

```bash
npm run dev
```

This starts both frontend (Vite on port 5173) and backend (Express on port 5000) concurrently.
On first startup, the server will automatically migrate existing blogs to add SEO-friendly slugs.

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

4. **Create a Test Account**

- Go to http://localhost:5173/register
- Sign up with email and password
- Explore! Create blogs, browse the feed, update your profile, etc.

---

## 📁 Project Structure

```
vibeblog/
├── client/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Header.jsx      # Navigation header with active highlighting
│   │   │   ├── Footer.jsx      # Footer
│   │   │   ├── BlogCard.jsx    # Blog card component with slug links
│   │   │   ├── VlogCard.jsx    # (Deprecated - for legacy support)
│   │   │   └── PrivateRoute.jsx # Protected route guard
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.jsx    # Infinite scroll feed with category filter
│   │   │   ├── LoginPage.jsx   # Login form
│   │   │   ├── RegisterPage.jsx # Registration form
│   │   │   ├── CreateBlogPage.jsx # Create blog form
│   │   │   ├── BlogDetailPage.jsx # Single blog view with comments
│   │   │   ├── ProfilePage.jsx # User profile with settings
│   │   │   └── NotFoundPage.jsx # 404 page
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── index.js        # useTheme, useIsMounted, useInfiniteScroll, etc.
│   │   ├── store/              # Zustand stores
│   │   │   ├── themeStore.js   # Dark/light mode
│   │   │   └── authStore.js    # User auth state with profile update
│   │   ├── lib/                # Utilities
│   │   │   ├── apiClient.js    # Axios with auth interceptors
│   │   │   └── utils.js        # Helper functions
│   │   ├── styles/
│   │   │   └── globals.css     # Tailwind + custom styles (minimal gradients)
│   │   ├── App.jsx             # Main app component with routes
│   │   └── main.jsx            # Entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite config
│   ├── tailwind.config.js      # Tailwind theming
│   ├── postcss.config.js       # PostCSS config
│   ├── vercel.json             # Vercel deployment config
│   └── package.json
│
├── server/                     # Express + Mongoose backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # MongoDB connection with graceful shutdown
│   │   │   └── environment.js  # Environment configuration validation
│   │   ├── models/
│   │   │   ├── User.js         # User model with bcrypt & profile image
│   │   │   ├── Blog.js         # Blog model with URL slugs
│   │   │   └── Comment.js      # Comment model (if applicable)
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register/login/password change/profile image
│   │   │   └── blogController.js  # CRUD operations with slug support
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/auth endpoints
│   │   │   ├── blogRoutes.js      # /api/blogs endpoints with slug support
│   │   │   └── commentRoutes.js   # /api/comments endpoints (if applicable)
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification with role checking
│   │   │   ├── upload.js          # Multer + Sharp image processing
│   │   │   ├── validation.js      # Input validation & sanitization
│   │   │   └── error.js           # Error handler
│   │   ├── cron/
│   │   │   └── autoBlogGenerator.js # Daily auto-blog generation
│   │   ├── utils/
│   │   │   ├── migrateBlogs.js    # Slug migration for existing blogs
│   │   │   ├── logger.js          # Logging utility
│   │   │   └── imageStorage.js    # Image storage management
│   │   └── server.js           # Express app setup with migration
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── package.json
│
├── .env.example                # Environment variables template
├── .gitignore
├── package.json               # Root package with npm scripts
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change user password (requires old password verification)
- `POST /api/auth/profile-image` - Upload/update profile image

### Blogs (Public)
- `GET /api/blogs` - Get all blogs (paginated + filterable by category)
- `GET /api/blogs/trending` - Get trending auto-generated blogs
- `GET /api/blogs/:slug_or_id` - Get single blog by slug or ID (backward compatible)

### Blogs (Protected)

- `POST /api/blogs` - Create new blog (multipart/form-data with image)
- `GET /api/blogs/user/me` - Get user's blogs
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
---

## 🎨 URL Slug System

### How It Works

Blog URLs are now **SEO-friendly slugs** instead of MongoDB IDs:

**Before**: `http://localhost:5173/blog/507f1f77bcf86cd799439011`
**After**: `http://localhost:5173/blog/my-awesome-blog-post`

### Slug Generation

- Title: "My Awesome Blog Post!" → Slug: `my-awesome-blog-post`
- Title: "Hello, World!!" → Slug: `hello-world`
- Duplicate titles: Auto-numbered → `my-post-1`, `my-post-2`, etc.

### Migration

On first server startup, all existing blogs **automatically migrate** to have slugs:

- Slugs are generated from blog titles
- Conflict prevention built-in
- Non-destructive update (only adds missing slugs)
- API accepts both slugs and IDs (backward compatible)

### Backend Lookup

The API intelligently searches:

1. First by slug (user-friendly URL)
2. Then by ObjectId (for old links and internal operations)
3. Prevents errors from invalid data types
---

## 🤖 Auto-Blog Generation

The system runs a cron job **daily at 00:00 UTC**:

1. **Discover Trends**: Uses Groq to identify global trending topics across categories
2. **Generate Content**: Uses Groq API (openai SDK compatible) to create a neutral 400-600 word blog
3. **Balance Categories**: Prioritizes underrepresented categories so coverage remains regular
4. **Fetch Image**: Uses Unsplash when configured; otherwise blogs are still generated without images
5. **Save to DB**: Stores in MongoDB with `autoGenerated: true` flag and trend metadata

Run `npm run dev` in development to see auto-blogs generated on startup (if count < 3).

---

## 👤 User Profile & Settings

### Profile Features

- **Profile Picture**: Upload and update your profile image in real-time
- **Password Management**: Change password with old password verification
  - Old password must match stored hash
  - New password must be at least 6 characters
  - Confirmation password must match
- **Account Information**: View your name, email, and member since date
- **Blog Collection**: See all blogs you've created in one place

### Implementation

- Password hashing: bcryptjs with 10 salt rounds
- Profile image: Multipart form-data with Sharp compression
- User state: Stored in Zustand with updateUser action
- Protected endpoints: JWT authentication required

---

## 🎨 Design System

**Colors** (Tailwind CSS):

- Primary: `#031130` (deep blue) - accents, links, buttons
- Accent: `#16a361` (green) - trending badges, highlights
- Background: `#0f172a` (dark slate) - main background
- Surface: `#1e2937` - cards, containers
- Text: `#f8fafc` - primary text
- Muted: `#64748b` - secondary text

**Gradients** (Minimal & Strategic):

- Logos: `from-primary to-primary/70` - Brand identity
- Avatars: `from-primary to-primary/70` - Visual distinction
- Hero titles: `from-primary to-primary/70` - Visual hierarchy
- Card backgrounds: `from-surface/80 to-surface` - Subtle depth
- Placeholders: `from-primary/20 to-primary/10` - Light accent

**Typography**:

- Headings: Inter (fallback: ui-sans-serif)
- Body: ui-serif (Georgia fallback) for optimal reading
- Code: JetBrains Mono

**Components**:

- All built with Tailwind + balanced design
- Smooth transitions, rounded corners
- Reading view max-width: 42rem with ample line height
- Active link highlighting in navigation

---

## ⚡ Performance

This project is optimized for fast startup and excellent runtime performance:

- **Server startup**: 2-4 seconds (down from 2-5 minutes!)
- **Client bundle**: ~450 KB (with code splitting)
- **Auto-blog generation**: Runs in background, doesn't block startup
- **Database queries**: Optimized with indexes for sub-100ms response times
- **Lazy-loaded routes**: Faster initial page load

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB Atlas (free tier works great)
- API Keys:
  - [NewsAPI.org](https://newsapi.org) - Free tier (100 requests/day)
  - [Groq API](https://groq.com) - Free tier with generous limits
  - [Unsplash API](https://unsplash.com/api) - Free tier

### Local Development

1. **Clone and Install Dependencies**

```bash
git clone <your-repo-url>
cd vibeblog
npm install
cd client && npm install && cd ../server && npm install && cd ..
```

2. **Set Up Environment Variables**

Copy `.env.example` to `.env` at the root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/vibeblog?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-for-production
PORT=5000
CLIENT_URL=http://localhost:5173
NEWSAPI_KEY=your_newsapi_key
GROQ_API_KEY=your_groq_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
NODE_ENV=development
```

3. **Run Development Servers**

```bash
npm run dev
```

This starts both frontend (Vite on port 5173) and backend (Express on port 5000) concurrently.

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

4. **Create a Test Account**

- Go to http://localhost:5173/register
- Sign up with email and password
- Explore! Create blogs, browse the feed, etc.

---

## 📁 Project Structure

```
vibeblog/
├── client/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Header.jsx      # Navigation header
│   │   │   ├── Footer.jsx      # Footer
│   │   │   ├── BlogCard.jsx    # Blog card component
│   │   │   └── PrivateRoute.jsx # Protected route guard
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.jsx    # Infinite scroll feed
│   │   │   ├── LoginPage.jsx   # Login form
│   │   │   ├── RegisterPage.jsx # Registration form
│   │   │   ├── CreateBlogPage.jsx # Create blog form
│   │   │   ├── BlogDetailPage.jsx # Single blog view
│   │   │   ├── ProfilePage.jsx # User profile
│   │   │   └── NotFoundPage.jsx # 404 page
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── index.js        # useTheme, useIsMounted, useInfiniteScroll, etc.
│   │   ├── store/              # Zustand stores
│   │   │   ├── themeStore.js   # Dark/light mode
│   │   │   └── authStore.js    # User auth state
│   │   ├── lib/                # Utilities
│   │   │   ├── apiClient.js    # Axios with auth interceptors
│   │   │   └── utils.js        # Helper functions
│   │   ├── styles/
│   │   │   └── globals.css     # Tailwind + custom styles
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite config
│   ├── tailwind.config.js      # Tailwind theming
│   ├── postcss.config.js       # PostCSS config
│   ├── vercel.json             # Vercel deployment config
│   └── package.json
│
├── server/                     # Express + Mongoose backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js         # User model with bcrypt
│   │   │   └── Blog.js         # Blog model with image Buffer
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register/login logic
│   │   │   └── blogController.js  # CRUD operations
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/auth endpoints
│   │   │   └── blogRoutes.js      # /api/blogs endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── upload.js          # Multer + Sharp image processing
│   │   │   └── error.js           # Error handler
│   │   ├── cron/
│   │   │   └── autoBlogGenerator.js # Daily auto-blog generation
│   │   └── server.js           # Express app setup
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── package.json
│
├── .env.example                # Environment variables template
├── .gitignore
├── package.json               # Root package with npm scripts
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Blogs (Public)

- `GET /api/blogs` - Get all blogs (paginated + filterable)
- `GET /api/blogs/trending` - Get trending auto-generated blogs
- `GET /api/blogs/:id` - Get single blog by ID

### Blogs (Protected)

- `POST /api/blogs` - Create new blog (multipart/form-data with image)
- `GET /api/blogs/user/me` - Get user's blogs
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

---

## 🤖 Auto-Blog Generation

The system runs a cron job **daily at 00:00 UTC**:

1. **Discover Trends**: Uses Groq to identify global trending topics across categories
2. **Generate Content**: Uses Groq API (openai SDK compatible) to create a neutral 400-600 word blog
3. **Balance Categories**: Prioritizes underrepresented categories so coverage remains regular
4. **Fetch Image (Optional)**: Uses Unsplash when configured; otherwise blogs are still generated without images
5. **Save to DB**: Stores in MongoDB with `autoGenerated: true` flag and trend metadata

Run `npm run dev` in development to see auto-blogs generated on startup (if count < 3).

---

## 🎨 Design System

**Colors** (Tailwind CSS):

- Primary: `#031130` (deep blue) - accents, links, buttons
- Accent: `#16a361` (green) - trending badges, highlights
- Background: `#0f172a` (dark slate) - main background
- Surface: `#1e2937` - cards, containers
- Text: `#f8fafc` - primary text
- Muted: `#64748b` - secondary text

**Typography**:

- Headings: Inter (fallback: ui-sans-serif)
- Body: ui-serif (Georgia fallback) for optimal reading
- Code: JetBrains Mono

**Components**:

- All built with Tailwind + Shadcn/UI patterns
- Hero shadows, smooth transitions, rounded corners
- Reading view max-width: 42rem with ample line height

---

## 📦 Production Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import Git repo
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Environment**: Add `VITE_API_URL` = `https://your-backend-domain.com`
   - Deploy!

3. **Result**: Your frontend is live at `https://vibeblog-xxxxx.vercel.app`

### Backend Deployment (Render or Railway)

#### Option A: Render (Free Tier - Recommended)

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. **Root Directory**: `server`
4. **Runtime**: Node
5. **Build Command**: `npm install`
6. **Start Command**: `node src/server.js`
7. **Environment Variables**:
   ```
   MONGO_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<secure-random-string>
   PORT=5000
   CLIENT_URL=https://vibeblog-xxxxx.vercel.app
   NEWSAPI_KEY=<your-key>
   GROQ_API_KEY=<your-key>
   UNSPLASH_ACCESS_KEY=<your-key>
   NODE_ENV=production
   ```
8. Deploy! (Slug migration runs automatically on first startup)

#### Option B: Railway.app

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repo, `server` folder
4. Add environment variables (same as above)
5. Deploy! (Slug migration runs automatically on first startup)

### Result

- Backend API: `https://vibeblog-api.onrender.com` or Railway equivalent
- Cron jobs run automatically (node-cron is persistent on Render/Railway)
- MongoDB connection works globally
- Blog slug migration completes on first startup

---

## 🔑 How to Get API Keys

### NewsAPI

1. Go to https://newsapi.org
2. Sign up (free tier: 100 requests/day)
3. Copy your API key

### Groq API

1. Go to https://groq.com
2. Sign up (free tier with generous monthly limits)
3. Navigate to API section
4. Create API key

### Unsplash

1. Go to https://unsplash.com/developers
2. Register application
3. Copy client ID

### MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free tier cluster
3. Create connection string (user@password)
4. Use in `MONGO_URI`

---

## 🛠️ Development Commands

```bash
# Root level
npm run dev          # Start both frontend & backend concurrently
npm run build        # Build both projects
npm run preview      # Preview built frontend

# Frontend (cd client/)
npm run dev          # Start Vite dev server on port 5173
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format with Prettier

# Backend (cd server/)
npm run dev          # Start with nodemon watch on port 5000
npm start            # Run production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

---

## 🧪 Testing the Application

1. **Register** at http://localhost:5173/register
2. **Login** at http://localhost:5173/login
3. **Update Profile** (optional):
   - Go to Profile page
   - Upload a profile picture
   - Change your password
   - View your account information
4. **Create a Blog**: Click "Create" → Fill form → Upload image → Publish
5. **View Feed**: Scroll through blogs, filter by category
6. **Read Blog**: Click any blog to see full article with markdown rendering
   - URL will show `/blog/your-blog-slug` instead of ID
7. **View Profile**: See all your created blogs
8. **Navigation**: Current page is highlighted in navbar

**Test Auto-Generated Blogs**:

- On startup (dev mode), auto-blogs are generated if count < 3
- You'll see "AI Generated" badge and Zap icon on those blogs
- In production, new auto-blogs generate daily at 00:00 UTC

---

## 🚀 Performance Optimizations

- **Image Optimization**: All images converted to WebP and compressed <100KB
- **Lazy Loading**: Images loaded on demand, optimized with intersection observer
- **Caching**: TanStack Query caches for 5-10 minutes
- **Code Splitting**: React Router lazy routes ready for implementation
- **Database Indexes**: Indexed queries on category, author, createdAt, **slug**
- **Pagination**: Infinite scroll with server-side pagination (9 blogs/page)
- **CDN**: Vercel automatically serves static files from global CDN
- **Slug Migration**: One-time automatic migration on first backend startup
- **URL-Based Caching**: Slug URLs enable better browser caching

---

## 📝 Environment Variables Checklist

Create `.env` at root with all these (see `.env.example`):

```
✓ MONGO_URI - MongoDB Atlas connection string
✓ JWT_SECRET - Min 32 characters for production
✓ PORT - Default 5000
✓ CLIENT_URL - Frontend URL (local: http://localhost:5173)
✓ NEWSAPI_KEY - NewsAPI key
✓ GROQ_API_KEY - Groq API key
✓ UNSPLASH_ACCESS_KEY - Unsplash API key
✓ NODE_ENV - development/production
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

- Check `.env` MONGO_URI is correct
- Ensure MongoDB Atlas firewall allows your IP (0.0.0.0/0 for dev)
- Test connection string in MongoDB Atlas UI

### "CORS error in browser"

- `CLIENT_URL` in backend .env must match frontend origin
- On Vercel/Render, set `CLIENT_URL` to your Vercel frontend URL

### "Image upload fails"

- Max file size is 5MB - try smaller image
- Ensure `/server/src/middleware/upload.js` processes images correctly
- Check Sharp is installed: `npm ls sharp`

### "Auto-blogs not generating"

- In production Render/Railway, cron runs in background (no logs visible)
- Check MongoDB for blogs with `autoGenerated: true`
- Verify all API keys (NewsAPI, Groq, Unsplash) are correct

### "Blog slug migration errors"

- Check server logs for migration status: `📝 Running blog slug migration...`
- Slugs should be created from blog titles on first startup
- Existing blogs will get slugs automatically (non-destructive)
- If migration fails, it continues with server startup (non-blocking)

### "Cannot access blog with slug"

- Ensure server has restarted (to run migration if needed)
- Check MongoDB that blog has `slug` field set
- URL should be `/blog/your-slug-name` (lowercase, hyphens)
- Old ID URLs still work for backward compatibility

### "Profile image not showing"

- Ensure image upload is configured in `.env` and backend
- Check Sharp library is installed: `npm ls sharp`
- Profile image field should exist in User schema

### "Password change not working"

- Old password must match the hashed password in database
- New password must be at least 6 characters
- Confirmation password must match new password exactly

---

## 📚 Tech Stack Breakdown

**Frontend:**

- React 19 + Vite 8 (SSR ready)
- TanStack Query v5 (async state with caching)
- Zustand (local state: theme, auth, user)
- Tailwind CSS (utility-first styling with minimal gradients)
- React Router v6 (client-side routing with active link detection)
- Lucide React (icons)
- Axios (HTTP client with auth interceptors)
- React Markdown (markdown rendering)

**Backend:**

- Express 4.18 (web framework)
- Mongoose 8 (ODM with slug support)
- JWT + bcryptjs (authentication with password hashing)
- Multer (file uploads)
- Sharp (image processing to WebP)
- Node-Cron (scheduling auto-blog generation)
- Groq API (via OpenAI SDK) (AI generation)
- Axios (HTTP requests for news/images)
- Winston (logging)

**Database:**

- MongoDB Atlas (cloud database with indexes)

**Deployment:**

- Vercel (frontend CDN + hosting)
- Render or Railway (backend + cron persistence)

---

## 📄 License

MIT License - Build anything you want with this!

---

## 🤝 Contributing

Feel free to fork, improve, and submit PRs!

---

## 💬 Support

Stuck? Check:

1. GitHub Issues
2. API Key validity in `.env`
3. MongoDB connection string
4. Network request logs in browser DevTools
5. Server logs: `npm run dev`
6. Blog migration logs (check for "Running blog slug migration..." on startup)

---

**Built with ❤️ for the 2026 web**

Happy blogging! 🚀
