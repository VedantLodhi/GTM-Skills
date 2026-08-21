"""App settings — typed env vars via pydantic-settings.

Standalone project: no dependency on any OutMate settings module.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "GTM Skills Showcase API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+psycopg://gtm:gtm_dev_password@localhost:5433/gtm_skills"

    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"

    @field_validator("DATABASE_URL")
    @classmethod
    def _force_psycopg3_driver(cls, v: str) -> str:
        """Render (and most other hosts) hand out a driver-less connection
        string — `postgresql://...` or the legacy `postgres://...` — since
        that's the Postgres standard, not a SQLAlchemy one. SQLAlchemy
        treats a driver-less `postgresql://` scheme as an implicit request
        for psycopg2, which this project deliberately does not install
        (psycopg 3 only, per requirements.txt) — that mismatch is exactly
        what raised `ModuleNotFoundError: No module named 'psycopg2'` at
        engine-creation time in production. This normalizes any
        driver-less scheme to the psycopg3 driver actually installed, no
        matter whether DATABASE_URL came from the default above or from a
        real env var (e.g. Render's own DATABASE_URL) — the local default
        already happened to spell out `+psycopg`, but the env var almost
        never will, and the env var always wins. A URL that already names
        an explicit driver (`+psycopg`, or anything else) is left alone.
        """
        if v.startswith("postgres://"):
            return "postgresql+psycopg://" + v[len("postgres://"):]
        if v.startswith("postgresql://"):
            return "postgresql+psycopg://" + v[len("postgresql://"):]
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
