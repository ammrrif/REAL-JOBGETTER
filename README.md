# AI Hiring Assistant

A prototype SaaS-style web app for HR teams: save a job opening once, screen any number of
candidates against it, and get an instant AI-style hiring report — hiring match score, candidate
strengths, hiring risks, development areas, suggested training, and a categorized, flashcard-style
interview kit — plus a talent screening dashboard that ranks every candidate you've screened,
filterable by job opening.

## Tech Stack

- **Client:** React + Vite + TypeScript + Tailwind CSS + React Router
- **Server:** Node.js + Express + TypeScript

No database, no API keys, no `.env` file needed either way. HR accounts and the candidate roster
are mocked in the browser's `localStorage` — this is a prototype, not a production ATS.

## Option A: Run with Docker (recommended for judges)

Only requirement: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
and running. No Node.js install needed on the host at all.

```bash
docker compose up --build
```

Then open **http://localhost:5175**.

This builds two containers — the Express API (port 5001) and the React app served by nginx
(port 5175, which proxies `/api` to the backend internally). Stop with `Ctrl+C`, or
`docker compose down` to remove the containers.

## Option B: Run with Node.js directly

### Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8 — check with `node -v`). No database, no
  API keys, no `.env` file needed for now since it is just a prototype and showing our idea.

### Getting Started

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
docker-compose.yml    Orchestrates the client + server containers

client/               React + Vite + TS frontend
  Dockerfile           Multi-stage build -> served by nginx
  nginx.conf           Serves the SPA, proxies /api to the server container
  src/pages/           Home, Login, Signup, ScreenCandidate, HiringReport, InterviewKit, Dashboard
  src/components/      Navbar, Footer, Logo, AuthLayout, ProtectedRoute, Button, Card,
                       ScoreGauge, FileDropzone, LoadingOverlay
  src/context/         AuthContext (mock HR auth), ToastContext (notifications)
  src/lib/             api.ts (fetch client), fileParser.ts (PDF/TXT text extraction),
                       candidateStore.ts (localStorage candidate roster + hiring decision logic),
                       jobOpeningStore.ts (localStorage reusable job openings),
                       linkedin.ts (LinkedIn people-search link builder)

server/               Node + Express + TS backend
  Dockerfile           Multi-stage build -> runs compiled dist/index.js
  src/routes/          analyzeRoutes.ts -> POST /api/analyze
  src/controllers/     analyzeController.ts
  src/services/        aiService.ts (mock AI screening logic)
  src/types/           shared request/response types
```

## Flow

Home → HR Login / Portal Access → Screen a Candidate (select a saved Job Opening or create a new
one → Candidate Profile → Review) → Hiring Report (score, hire/maybe/reject recommendation,
risks, shortlist, LinkedIn search shortcut) → Interview Kit Generator (flashcard-style,
categorized Technical/Behavioral/Skill-Gap questions, no typing required) → Talent Screening
Dashboard (all screened candidates, ranked and filterable by job opening)

Job Openings are saved the first time you screen a candidate against them, so screening a second
or third candidate for the same role is just a couple of clicks — no re-pasting the requirements.

### What's real vs. simulated

- **Real:** the client/server architecture, routing and auth-gating, and PDF/TXT resume text
  extraction (via `pdfjs-dist`, actually reading the file's text layer in-browser).
- **Simulated:** HR accounts, the candidate roster, and job openings (all mocked in
  `localStorage`, no real backend auth or database), and the "AI" screening itself — a
  deterministic keyword-matching engine (`server/src/services/aiService.ts`), not a call to a
  real LLM.
- **External links:** the "Search on LinkedIn" shortcuts open LinkedIn's public people-search in
  a new tab, pre-filled with the candidate's name — the app never fetches, scrapes, or stores any
  LinkedIn data.

## Troubleshooting

- **"Port already in use"**: Both the Docker and Node.js paths use ports 5001 and 5175. If
  either is taken, edit the port mappings in `docker-compose.yml` (e.g. `"5176:80"`) or, for
  the Node.js path, run `PORT=5002 npm run dev --prefix server` and update the `target` in
  `client/vite.config.ts`'s proxy config to match, then restart.
- **Frontend won't start / Vite errors on launch (Node.js path only)**: Check your Node
  version (`node -v`) — Vite 8 requires Node 20.19+ or 22.12+. This doesn't apply to the
  Docker path, since the build runs inside a container with a pinned Node version.
- **Blank page or 404 on `/api/analyze`**: Make sure the backend is running — the frontend
  proxies `/api/*` to the backend in both the Docker and Node.js setups.
- **Docker: `docker compose up` fails immediately**: Make sure Docker Desktop is actually
  running (not just installed) before running the command.
