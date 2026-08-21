"""SQLAlchemy engine + session factory.

Deliberately simple — a single small pool against a local Postgres
container. No pgbouncer/transaction-pooler split like a large production
system would need; this is a single-instance demo app.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=5,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
