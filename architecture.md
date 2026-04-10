vibeblog/
├── client/                 # Vite + React 19 – deployed to Vercel
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── lib/
│   │   └── App.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express + Mongoose – deployed to Render or Railway
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── cron/           # autoBlogGenerator.js
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
│
├── docs/
├── .env
├── .gitignore
└── package.json (root – dev scripts only, no production start here)



## Principles & Deployment
- Monorepo for development.
- Frontend → Vercel: auto-builds React/Vite SPA, global CDN.
- Backend → Render/Railway: persistent Node process (supports node-cron 24/7), web service starts `server/src/server.js`.
- API base URL: use env var `VITE_API_URL` in client (https://your-backend.up.railway.app or render.com)
- CORS: backend allows frontend domain only.
- Image storage: still MongoDB Buffer (WebP compressed).
- No Docker needed.