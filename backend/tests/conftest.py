"""Shared pytest fixtures.

Practical test-DB strategy, no extra infra: reuse the same local Postgres
container already running for dev (docker-compose.yml), but point tests at
a second database — `gtm_skills_test` — created on first run. Each test
gets a clean slate via delete-all-tables + reseed rather than a
savepoint/rollback recipe, since the service layer commits internally and
that recipe would fight it; this DB is a disposable test fixture, so a
plain delete+reseed per test is simpler and just as correct.
"""
from __future__ import annotations

import os
import re
import uuid

# Must be set before `app.main` is imported (below, via the `client`
# fixture) — its startup event checks this to skip touching the real dev
# database. Tests bootstrap/seed their own database instead.
os.environ.setdefault("SKIP_DB_BOOTSTRAP", "true")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.base import Base
from app.db.deps import get_db
from app.db.models import *  # noqa: F401,F403 — register every table on Base.metadata
from app.seed.seed import seed as seed_content


def _swap_db_name(url: str, new_name: str) -> str:
    return re.sub(r"/([A-Za-z0-9_\-]+)(\?.*)?$", rf"/{new_name}\2", url)


TEST_DATABASE_URL = _swap_db_name(settings.DATABASE_URL, "gtm_skills_test")


@pytest.fixture(scope="session")
def engine():
    # Create the test database (once) if it doesn't exist yet.
    admin_url = _swap_db_name(settings.DATABASE_URL, "postgres")
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": "gtm_skills_test"},
            ).scalar()
            if not exists:
                conn.execute(text('CREATE DATABASE "gtm_skills_test"'))
    finally:
        admin_engine.dispose()

    eng = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def db_session(engine):
    """Cleans and reseeds the test database before each test, then yields a
    sessionmaker — NOT a single shared Session. The `client` fixture below
    opens a fresh session per request through it, exactly like the real
    app's `get_db()` does with `SessionLocal()`. That matters: sharing one
    long-lived Session across multiple HTTP calls in a test lets SQLAlchemy's
    identity map serve a stale, already-loaded `.items` collection to a
    later call even after a commit — a test-only artifact that doesn't
    exist in the real app, where every request gets its own session."""
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    setup = TestingSessionLocal()
    for table in reversed(Base.metadata.sorted_tables):
        setup.execute(table.delete())
    setup.commit()
    seed_content(setup)
    setup.close()
    yield TestingSessionLocal


@pytest.fixture()
def client(db_session):
    from app.main import app

    def _override_get_db():
        session = db_session()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def session_headers():
    """A fresh, unique anonymous session per test — mirrors what the
    frontend generates in localStorage."""
    return {"X-Session-Id": f"test-session-{uuid.uuid4()}"}
