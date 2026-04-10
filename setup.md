# VibeBlog Setup & Deployment Guide (Vercel + Render/Railway)

## Local Development
1. Prerequisites: Node 20+, MongoDB Atlas, API keys (NewsAPI, Groq, Unsplash)
2. `git clone ... && cd vibeblog`
3. `npm install` (root)
4. `cd client && npm install && cd ../server && npm install`
5. Copy `.env.example` → `.env` (root or server folder)
   - MONGO_URI=...
   - JWT_SECRET=...
   - NEWSAPI_KEY=...
   - GROQ_API_KEY=...
   - UNSPLASH_ACCESS_KEY=...
   - PORT=5000
   - CLIENT_URL=http://localhost:5173
6. Run: `npm run dev` (root – concurrently client + server)

## Production Deployment
### Frontend (Vercel)
1. Push repo to GitHub.
2. Go to vercel.com → New Project → Import Git repo.
3. Root Directory: `client`
4. Framework Preset: Vite
5. Environment Variables: add `VITE_API_URL=https://your-backend-domain.com`
6. Deploy → auto-build & domain (e.g. vibeblog-client.vercel.app)

### Backend (Render – recommended free tier)
1. Go to render.com → New → Web Service → connect Git repo.
2. Root Directory: `server`
3. Runtime: Node
4. Build Command: `npm install`
5. Start Command: `node src/server.js`
6. Add Environment Variables (same as .env but without CLIENT_URL – use your Vercel frontend URL for CORS)
7. Free tier: sleeps after inactivity (cold starts ok for blog API)
   → Alternative: Railway.app (similar steps, usage credits)

Cron (node-cron) runs automatically on backend start – generates daily blogs.