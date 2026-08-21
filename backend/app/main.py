"""GTM Skills Showcase — FastAPI app factory.

Standalone demo project. No OutMate imports, no shared infrastructure.
"""
import logging

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
    # Dev-safety net: create tables if `alembic upgrade head` hasn't been run
    # yet. In a real deploy, Alembic migrations are the source of truth —
    # this is only a convenience for first-run local dev.
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
