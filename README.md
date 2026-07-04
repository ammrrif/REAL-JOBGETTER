# AI JobGetter

A prototype SaaS-style web app: upload a resume, paste a job description, and get an instant
AI-style match analysis — score, strengths, missing skills, weaknesses, improvements,
certifications, and mock interview questions.

**No real AI, no database, no auth.** The `/api/analyze` endpoint runs deterministic,
keyword-based logic (`server/src/services/aiService.ts`) that compares resume text against
a job description to produce a realistic-looking analysis.

## Tech Stack

- **Client:** React + Vite + TypeScript + Tailwind CSS + React Router
- **Server:** Node.js + Express + TypeScript

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8 — check with `node -v`). No database, no
  API keys, no `.env` file needed.

## Getting Started

Install dependencies for both apps:

```bash
npm run install:all
```

Run both the client and server together:

```bash
npm run dev
```

- Client: http://localhost:5175
- Server: http://localhost:5001 (proxied from the client under `/api`)

Or run them individually:

```bash
npm run dev --prefix server   # http://localhost:5001
npm run dev --prefix client   # http://localhost:5175
```

## Project Structure

```
client/               React + Vite + TS frontend
  src/pages/           Home, Upload, Results
  src/components/      Navbar, Footer, Button, Card, ScoreGauge, FileDropzone, LoadingOverlay
  src/lib/             api.ts (fetch client), fileParser.ts (PDF/TXT text extraction)

server/               Node + Express + TS backend
  src/routes/          analyzeRoutes.ts -> POST /api/analyze
  src/controllers/     analyzeController.ts
  src/services/        aiService.ts (mock AI analysis logic)
  src/types/           shared request/response types
```

## Flow

Home → Upload (resume + job description) → Analyze → Results (score, insights, interview questions)

## Troubleshooting

- **"Port already in use"**: The backend defaults to port 5001. If it's taken, run
  `PORT=5002 npm run dev --prefix server` and update the `target` in
  `client/vite.config.ts`'s proxy config to match, then restart.
- **Frontend won't start / Vite errors on launch**: Check your Node version (`node -v`) —
  Vite 8 requires Node 20.19+ or 22.12+.
- **Blank page or 404 on `/api/analyze`**: Make sure the backend is running — the frontend
  proxies `/api/*` to `http://localhost:5001` in dev mode.
