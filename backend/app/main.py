"""GTM Skills Showcase — FastAPI app factory.

Standalone demo project. No OutMate imports, no shared infrastructure.
"""
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import gtm_skills
from app.config import settings
from app.db.base import Base
from app.db.models import *  # noqa: F401,F403 — registers all tables on Base.metadata
from app.db.session import SessionLocal, engine
from app.seed.seed import seed

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url=None if settings.is_production else "/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Session-Id"],
)

app.include_router(gtm_skills.router)
logger.info("GTM Skills router registered")


@app.on_event("startup")
def on_startup() -> None:
    # Test isolation: tests/conftest.py sets this before importing the app
    # so TestClient(app) never touches the real dev database — the test
    # suite bootstraps and seeds its own gtm_skills_test database instead.
    if os.getenv("SKIP_DB_BOOTSTRAP", "").lower() == "true":
        logger.info("[startup] SKIP_DB_BOOTSTRAP=true — skipping table creation and seed")
        return

    # Dev-safety net: create tables if `alembic upgrade head` hasn't been run
    # yet. In production, Alembic migrations are the ONLY source of truth
    # for schema — create_all is skipped entirely there. Running it in prod
    # would let the app silently bootstrap a schema straight from the
    # current models before a human ever runs `alembic upgrade head`,
    # which then makes that first real migration fail ("relation already
    # exists") because Alembic never got to create anything itself.
    if settings.is_production:
        logger.info("[startup] production — skipping create_all; schema is Alembic-managed")
    else:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception:
            logger.exception("[startup] table creation check failed")
            raise

    db = SessionLocal()
    try:
        seed(db)
    except Exception:
        logger.exception("[startup] seed failed")
        db.rollback()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok", "service": "gtm-skills-showcase-api"}


@app.get("/")
def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION, "docs": "/docs"}
