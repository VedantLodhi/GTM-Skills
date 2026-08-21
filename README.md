# GTM Skills Showcase

A standalone GTM Skills library — browse, run, and compose structured
go-to-market playbooks. Built as a probation-period product prototype;
**not** part of, and shares no code with, any other project.

```
Frontend (Next.js 16 / React 19)  →  REST  →  FastAPI  →  PostgreSQL
```

No auth, no LLM calls, no third-party API keys — content is 16 hand-written
GTM skills seeded into Postgres on backend startup. "Run" is a real,
persisted interaction (records a run + walks a deterministic step-by-step
guide), not an AI generation call.

## Quick start

**1. Database**
```bash
docker compose up -d          # Postgres on localhost:5433
```

**2. Backend**
```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate      # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
API docs: http://127.0.0.1:8000/docs — skills/collections/stages are seeded
automatically on startup (idempotent, safe to restart).

**3. Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                   # http://localhost:3000
```

The frontend proxies `/api/*` to the backend (`next.config.ts` rewrite +
`BACKEND_ORIGIN` env var) — no CORS setup needed, no hardcoded origin in
client code.

## Project layout

```
gtm-skills-showcase/
├── docker-compose.yml     # Postgres only — frontend/backend run on host
├── backend/               # FastAPI + SQLAlchemy + Alembic
│   └── app/
│       ├── api/routes/gtm_skills.py
│       ├── services/gtm_skills_service.py
│       ├── db/models/gtm_skill.py
│       ├── schemas/gtm_skills.py
│       └── seed/                 # hand-written GTM content + idempotent seeder
└── frontend/              # Next.js App Router + Tailwind v4
    ├── app/                      # /, /skills, /skills/[slug], /collections, /workflow
    ├── components/gtm/           # feature components
    ├── components/ui/            # self-built primitives
    └── lib/api/                  # typed API client
```

## What's real vs. simplified

- **Real:** Postgres persistence, Alembic migrations, full CRUD on
  bookmarks/workflow, server-rendered pages fetching live data, every
  "Run" click recorded as a DB row.
- **Simplified for scope:** no login — personalization is scoped to an
  anonymous `X-Session-Id` (random UUID in `localStorage`), not real auth.
  No LLM calls — "Run" is a structured, deterministic walkthrough built
  from the skill's own seeded content, not a generation call.

## Known limitation

On a direct (non-navigation) request to a missing `/skills/[slug]` or
`/collections/[slug]`, Next.js 16.3.2 renders the correct not-found UI but
returns HTTP 200 instead of 404 — a framework-level quirk on this very
recent Next.js version, not an app bug. Client-side navigation and the
`/nonexistent-route` catch-all both return a correct 404.
