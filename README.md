# GTM Skills Showcase

A production-style go-to-market skills library — browse a structured catalog
of GTM playbooks, filter by stage/role/category, inspect a skill's full
detail, run it (a real, persisted interaction with a deterministic
walkthrough or a copyable prompt template), bookmark it, and compose your
own sequence of skills into a personal workflow.

## 🚀 Live Demo

**Frontend:** [frontend-ruddy-pi-28.vercel.app](https://frontend-ruddy-pi-28.vercel.app)
**Backend API:** [gtm-skills-api.onrender.com](https://gtm-skills-api.onrender.com)

> Render's free tier spins the backend down when idle — the first request
> after a period of inactivity can take a few seconds to wake it up.

## ✨ Features

- Searchable, filterable GTM skills library
- Filters: stage, role, category, execution type, status, featured
- Full skill detail pages
- Imported GTM prompt templates alongside hand-written skills
- Copyable prompt template block (with a Copy button) for imported skills
- Deterministic, step-by-step Run walkthrough for native/assisted skills
- Persistent run history and run counts
- Anonymous, session-scoped bookmarks (no login required)
- Personal workflow builder — add, remove, and reorder skills
- Per-item workflow notes
- Curated skill collections
- Paginated skill listing
- REST API (FastAPI)
- PostgreSQL persistence
- Alembic-managed schema migrations
- Idempotent seed and GTM-repo import process
- Responsive Next.js UI, light/dark theme

"Run" is intentionally deterministic — it records a real run and walks a
structured guide or surfaces a prompt template. It does not call an LLM or
any AI model; there's no AI execution in this project.

## 🧠 GTM Skills Dataset

- **16** original, hand-written GTM skills with full structured
  when-to-use / inputs / workflow-step / output content
- **243** additional prompts imported from the open-source
  [gtm-skills/gtm](https://github.com/gtm-skills/gtm) repository
  (244 raw source records, 1 duplicate source id de-duplicated)
- **259** total skills once both are seeded
- The source content is vendored as a local JSON snapshot
  (`backend/app/seed/source_snapshots/`) — the importer never makes a live
  network call at runtime or at app startup
- Import is idempotent and keyed by the source record's own id — re-running
  it never creates duplicates
- Imported skills expose their original text as a copyable prompt template;
  hand-written skills keep the structured walkthrough/run experience

The importer's own docstring documents the full field-mapping and
stage/role assignment rationale in detail — this README intentionally
keeps that out to stay skimmable.

## 🏗️ Architecture

```
Browser
   ↓
Vercel / Next.js
   ↓  /api/* rewrite
Render / FastAPI
   ↓
SQLAlchemy
   ↓
Render PostgreSQL
```

- **Next.js App Router** frontend — server-rendered pages fetch live data
- **FastAPI** REST API — layered routes → services → SQLAlchemy models
- **SQLAlchemy + Alembic** — the database schema is migration-managed, not
  inferred at runtime
- **PostgreSQL** persistence for every skill, bookmark, run, and workflow
- Vercel proxies `/api/*` to the backend via the `BACKEND_ORIGIN`
  environment variable — the browser never talks to Render directly, and
  no backend URL is hardcoded in client code

## 🛠️ Tech Stack

**Frontend**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic Settings
- psycopg 3

**Database**
- PostgreSQL

**Deployment**
- Vercel (frontend)
- Render (backend + PostgreSQL)
- Docker (local PostgreSQL only)

**Testing**
- pytest

## 📁 Project Structure

```
gtm-skills-showcase/
├── docker-compose.yml        # Local PostgreSQL only — not used in production
├── render.yaml               # Render Blueprint (optional, reviewed before use)
├── backend/                  # FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/routes/       # HTTP route handlers
│   │   ├── services/         # Business logic
│   │   ├── db/models/        # SQLAlchemy models
│   │   ├── schemas/          # Pydantic response/request models
│   │   └── seed/             # Hand-written seed data + GTM repo importer
│   ├── alembic/               # Migrations
│   └── tests/                 # pytest suite
└── frontend/                  # Next.js App Router
    ├── app/                    # /, /skills, /skills/[slug], /collections, /workflow
    ├── components/
    │   ├── gtm/                 # Feature components
    │   └── ui/                  # Primitives
    └── lib/api/                 # Typed API client
```

## ⚡ Local Development

**Database**
```bash
docker compose up -d
```

**Backend**
```bash
cd backend
python -m venv .venv
```
Windows:
```powershell
.\.venv\Scripts\Activate.ps1
```
macOS/Linux:
```bash
source .venv/bin/activate
```
```bash
pip install -r requirements.txt
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux

alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
copy .env.example .env.local     # Windows
# cp .env.example .env.local     # macOS/Linux

npm run dev
```

| | |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://127.0.0.1:8000 |
| Docs | http://127.0.0.1:8000/docs |

## 🧪 Testing

**Backend**
```bash
cd backend
pip install -r requirements-dev.txt
pytest -q
```

**Frontend**
```bash
cd frontend
npm run typecheck
npm run build
```

## 🔌 API

```
GET    /health
GET    /api/stages
GET    /api/skills
GET    /api/skills/{slug}
GET    /api/collections
GET    /api/collections/{slug}
POST   /api/skills/{slug}/run
POST   /api/skills/{slug}/bookmark
DELETE /api/skills/{slug}/bookmark
GET    /api/bookmarks
GET    /api/workflow
POST   /api/workflow/items
PATCH  /api/workflow/items/{item_id}
DELETE /api/workflow/items/{item_id}
```

`GET /api/skills` supports search (`q`), filtering (`stage`, `role`,
`category`, `execution_type`, `status`, `featured`), and pagination
(`page`, `limit`, with totals returned as `X-Total-Count` / `X-Total-Pages`
response headers). Personalized endpoints (bookmarks, workflow, run) are
scoped by an anonymous `X-Session-Id` header — no login required.

## 🚀 Production Deployment

**Render**
- PostgreSQL database
- FastAPI web service
  - Root directory: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - `DATABASE_URL` — from the Render PostgreSQL instance
  - `ENVIRONMENT=production`
  - `CORS_ALLOWED_ORIGINS` — the Vercel frontend URL

**Vercel**
- Root directory: `frontend`
- Framework auto-detected (Next.js) — no build/start overrides needed
- `BACKEND_ORIGIN=https://gtm-skills-api.onrender.com`

Migrations run automatically as part of the backend's own start command
above, so no separate manual migration step is needed after a deploy.

## 🔐 Security & Scope

- No API keys required — there are no third-party integrations
- No LLM credentials required — "Run" is deterministic, not AI-generated
- No production credentials or services from any other project are used
  anywhere in this codebase
- Database credentials are environment variables only, never committed
- Personalization (bookmarks, workflow) is anonymous, scoped by a random
  `X-Session-Id` — no accounts, no passwords, no PII
- No traditional login/authentication — intentionally out of scope for
  this prototype
- The GTM source snapshot is vendored locally; the importer makes no live
  external network requests at runtime or at startup

## 📌 Design Decisions

- **Deterministic execution over fake AI** — "Run" persists a real action
  and shows real content; it never simulates an LLM call
- **Real persistence** — PostgreSQL for every skill, run, bookmark, and
  workflow, not in-memory or mock data
- **Idempotent seeding/import** — re-running either process never
  duplicates data, safe to run repeatedly
- **Typed API client** — the frontend's API layer is fully typed against
  the backend's response shapes
- **Server-rendered data fetching** — list and detail pages fetch live
  data on the server, not via client-side loading spinners
- **Anonymous session model** — a lightweight session id instead of full
  authentication, appropriate for a public showcase with no user accounts

## 📄 License / Attribution

This repository does not currently include a license file. The imported
GTM skill content originates from the open-source
[gtm-skills/gtm](https://github.com/gtm-skills/gtm) repository (MIT
licensed) — see that repository for its full license and attribution
terms.

## 👤 Author

**Vedant Lodhi**
GitHub: [github.com/VedantLodhi](https://github.com/VedantLodhi)
LinkedIn: [linkedin.com/in/vedant-lodhi](https://www.linkedin.com/in/vedant-lodhi/)
