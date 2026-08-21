# GTM Skills Showcase

A standalone GTM Skills library — browse, run, and compose structured
go-to-market playbooks. Built as a probation-period product prototype;
**not** part of, and shares no code with, any other project.

```
Frontend (Next.js 16 / React 19)  →  REST  →  FastAPI  →  PostgreSQL
```

No auth, no LLM calls, no third-party API keys — content is 16 hand-written
GTM skills seeded into Postgres on backend startup, plus 243 prompts
imported from the open-source [gtm-skills/gtm](https://github.com/gtm-skills/gtm)
repository (259 total — see "GTM Skills Import" below). "Run" is a real,
persisted interaction (records a run + walks a deterministic step-by-step
guide, or surfaces a copyable prompt template for imported content), not
an AI generation call.

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
automatically on startup (idempotent, safe to restart — re-running the seed
never creates duplicates).

**Backend tests** (separate `gtm_skills_test` database, auto-created on
first run inside the same Postgres container — no extra infra):
```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

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

## GTM Skills Import

The 243 imported prompts come from a vendored offline snapshot
(`backend/app/seed/source_snapshots/gtm_skills_repo_prompts_snapshot.json`)
of [gtm-skills/gtm](https://github.com/gtm-skills/gtm)'s `src/lib/prompts.ts`
— the importer never makes a live network call. It's a separate, manually-run
step, never invoked automatically on app startup:

```bash
cd backend
python -m app.seed.import_gtm_skills_repo --dry-run   # report only, no writes
python -m app.seed.import_gtm_skills_repo              # writes to DATABASE_URL
```

Idempotent — upserts by the source record's own `id` (stored as
`GtmSkill.source_id`), so re-running it never creates duplicates. 244 raw
records, 1 duplicate id skipped (`sdr-linkedin-connection`), 243 imported.
Full mapping rationale is documented in the importer's own docstring.

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

## API

All routes live under `/api/*` (`GET /health` also works unprefixed, kept
for backward compatibility). `GET /api/skills` supports `stage`, `role`,
`category`, `execution_type`, `status`, `featured`, `q`, `page`, `limit` —
the response body stays a plain array (so the existing frontend client
needs no changes); pagination metadata is returned as response headers
(`X-Total-Count`, `X-Page`, `X-Limit`, `X-Total-Pages`) instead of wrapping
the body. `POST /api/skills/{slug}/bookmark` toggles on/off (unchanged);
`DELETE /api/skills/{slug}/bookmark` and `GET /api/bookmarks` are additive.
Adding a skill already in the workflow returns `409`; running a
`coming_soon` skill returns `409`.

## Production Deployment

Target architecture — same request flow as local dev, different hosts:

```
Vercel (Next.js frontend, root: frontend)
   ↓  /api/* rewrite → BACKEND_ORIGIN
Render Web Service (FastAPI backend, root: backend)
   ↓  DATABASE_URL
Render PostgreSQL
```

`docker-compose.yml`'s Postgres container is **local dev only** — production
always uses Render PostgreSQL, wired in purely through the `DATABASE_URL`
environment variable (never hardcoded, never committed).

A `render.yaml` Blueprint is included at the repo root for convenience —
see the note at the end of this section before using it. Everything below
also works by configuring the Render dashboard by hand; both paths reach
the same result.

### Step-by-step

**1. Create Render PostgreSQL**
Render dashboard → New → PostgreSQL. Any name (e.g. `gtm-skills-postgres`);
the free tier is enough for this project's scale (259 skills).

**2. Obtain the Render PostgreSQL connection URL**
On the database's page, copy the **Internal Database URL** (not the
external one — the backend service and database share a network on
Render, so internal is faster and isn't subject to external connection
limits). Looks like `postgresql://USER:PASSWORD@HOST/DBNAME`.

**3. Create Render Backend Web Service**
Render dashboard → New → Web Service → connect this GitHub repo
(`VedantLodhi/GTM-Skills`).

**4. Set Root Directory**
```
backend
```

**5. Set Build Command**
```
pip install -r requirements.txt
```

**6. Set Start Command**
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Note: this repo doesn't pin a Python version (no `.python-version` /
`runtime.txt`) since Render's currently-supported versions can't be
verified from here — check Render's dashboard/docs for their default and
set `PYTHON_VERSION` (or add `.python-version`) if the app needs a newer
one than their default (3.11+ is required — the codebase uses modern
union-type syntax like `str | None`).

**7. Set backend environment variables**

| Key | Value |
|---|---|
| `DATABASE_URL` | the Internal Database URL from step 2 |
| `ENVIRONMENT` | `production` |
| `LOG_LEVEL` | `INFO` |
| `CORS_ALLOWED_ORIGINS` | leave as `http://localhost:3000` for now — updated for real in step 17 |

Health check path: `/health`.

**8. Deploy backend**
Trigger the first deploy. It boots successfully even with an empty
database — `ENVIRONMENT=production` makes the app skip its dev-only
`create_all` safety net entirely (schema is Alembic-only in production),
so `/health` responds immediately; every other endpoint 500s until step 9.

**9. Run the Alembic migration against the production DB**
Render dashboard → backend service → **Shell** tab (runs inside the
deployed service, with its real environment variables already set):
```bash
# RENDER SHELL
cd backend   # if not already there
alembic upgrade head
```

**10. Run the GTM importer against the production DB**
Still in the Render Shell:
```bash
# RENDER SHELL
python -m app.seed.import_gtm_skills_repo
```

**11. Verify 259 skills**
```bash
# LOCAL — once you have the real backend URL
curl -s https://YOUR-BACKEND.onrender.com/api/skills -o /dev/null -D - | grep -i x-total-count
# expect: x-total-count: 259
```

**12. Copy the Render backend URL**
From the service's dashboard page — looks like `https://YOUR-BACKEND.onrender.com`.

**13. Create Vercel project**
Vercel dashboard → Add New → Project → import the same GitHub repo.

**14. Set Root Directory to frontend**
```
frontend
```

**15. Set BACKEND_ORIGIN**
Vercel → Project Settings → Environment Variables:
```
BACKEND_ORIGIN=https://YOUR-BACKEND.onrender.com
```
No trailing slash. Never `localhost` / `127.0.0.1` / `5433` in production.
This is read into `next.config.ts`'s rewrite table at build time, so any
later change to it needs a redeploy to take effect.

**16. Deploy frontend**
Trigger the deploy — Vercel auto-detects Next.js, no build/start command
overrides needed.

**17. Update backend CORS_ALLOWED_ORIGINS with the final Vercel URL**
Back on Render, update the backend service's env var:
```
CORS_ALLOWED_ORIGINS=https://YOUR-PROJECT.vercel.app
```
Comma-separate for more than one origin (e.g. add a preview deployment URL).

**18. Redeploy backend if necessary**
Render redeploys automatically on an env var change; trigger a manual
redeploy if it doesn't, so the new CORS origin takes effect.

**19. Perform final live smoke tests**
```bash
# LOCAL — replace both placeholder URLs first
curl -s https://YOUR-BACKEND.onrender.com/health
curl -s https://YOUR-BACKEND.onrender.com/api/skills -D - -o /dev/null | grep -i x-total-count
```
Then open `https://YOUR-PROJECT.vercel.app` in a browser: library loads,
search/stage/role filters work, both a hand-written skill detail page and
an imported one render correctly (the imported one shows a copyable
"Prompt template" block, no empty Inputs/Outputs sections), Run/Bookmark/
Add-to-Workflow all work, and the browser console shows no CORS errors.

### Deployment commands quick reference

**A. Local verification**
```bash
# LOCAL
cd backend && pytest -q
cd frontend && npm run typecheck && npm run build
```

**B. Alembic migration**
```bash
# LOCAL — your dev DB (docker-compose Postgres)
cd backend && alembic upgrade head

# RENDER SHELL — the production DB (DATABASE_URL is already the
# service's own env var — don't pass a different one)
cd backend && alembic upgrade head
```

**C. Production importer**
```bash
# RENDER SHELL ONLY. This command writes to whatever DATABASE_URL is set
# in the environment it runs in — in the Render Shell that's always the
# production database. Never export the production DATABASE_URL into a
# local shell just to run this; use the Render Shell instead so there's
# no way to point it at the wrong database.
cd backend && python -m app.seed.import_gtm_skills_repo
```

**D. Backend health verification**
```bash
# LOCAL, once you have the real URL
curl -s https://YOUR-BACKEND.onrender.com/health
curl -s https://YOUR-BACKEND.onrender.com/api/health
```

**E. Git deployment**
Both Vercel and Render deploy on push/merge to the connected branch
(typically `main`) — no separate deploy command:
```bash
# LOCAL
git push origin main
```

### render.yaml

A `render.yaml` Blueprint lives at the repo root, pinned to Render's free
tier for both the database and the web service. It wires `DATABASE_URL`
automatically from the database resource and leaves `CORS_ALLOWED_ORIGINS`
for manual entry (step 17 — the Vercel URL doesn't exist yet the first
time you'd apply it). Applying it via Render's "New Blueprint Instance"
flow provisions real infrastructure the moment you confirm it — review the
file first; it is not applied by anything in this repo automatically.

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
