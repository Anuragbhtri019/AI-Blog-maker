# VibeBlog Development Guidelines

## Coding Standards
- Pure JS + JSDoc + PropTypes.
- ESLint + Prettier enforced.
- Async/await everywhere.

## Library Decisions (Locked)
- Trending: NewsAPI.org (axios)
- AI: Groq via openai SDK – neutral factual prompt only
- Images: Unsplash + sharp → WebP Buffer
- Uploads: multer + sharp middleware
- Storage: MongoDB Buffer

## Rules
- In client: use `import.meta.env.VITE_API_URL` for axios/fetch
- Backend: CORS origin = process.env.CLIENT_URL || '*'
- Auto blogs: daily via node-cron, 5–8 posts
- Deployment note: Vercel frontend + Render/Railway backend (no serverless limitations on cron)

No deviations.