"""App settings — typed env vars via pydantic-settings.

Standalone project: no dependency on any OutMate settings module.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

# Hosts that never get an auto-added `sslmode` — the local docker-compose
# Postgres has no SSL configured at all, and forcing one would just break
# local dev for no benefit.
_LOCAL_DB_HOSTS = {"localhost", "127.0.0.1"}


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
    def _normalize_database_url(cls, v: str) -> str:
        """Makes whatever DATABASE_URL is actually supplied (default, local
        `.env`, or a real host's env var — e.g. Render's) safe to connect
        with, without ever hand-splicing the string. Two independent fixes,
        both applied through SQLAlchemy's own URL type rather than string
        concatenation — that matters here specifically because a password
        can legitimately contain characters (`@`, `:`, `/`, `%`, ...) that
        naive string surgery could misinterpret as URL structure; `make_url`
        /`render_as_string` round-trip the password's real bytes correctly
        no matter what's in it.

        1. Driver: Render (and most hosts) hand out a driver-less
           `postgresql://` or legacy `postgres://` — the Postgres standard,
           not a SQLAlchemy one. SQLAlchemy resolves a driver-less
           `postgresql://` to psycopg2, which this project never installs
           (psycopg 3 only, per requirements.txt) — that mismatch is what
           raises `ModuleNotFoundError: No module named 'psycopg2'` at
           engine-creation time. Forced to `postgresql+psycopg` here
           unless a driver was already named explicitly.

        2. SSL: Render's PostgreSQL rejects a connection that doesn't
           request SSL (`FATAL: SSL/TLS required`). `sslmode=require` is
           added automatically for any non-local host that doesn't already
           specify an explicit `sslmode` — never for localhost/127.0.0.1
           (docker-compose Postgres has no SSL configured), and never
           overriding a value the URL already sets.
        """
        url = make_url(v)

        if url.drivername in ("postgres", "postgresql"):
            url = url.set(drivername="postgresql+psycopg")

        if "sslmode" not in url.query and url.host not in _LOCAL_DB_HOSTS:
            url = url.update_query_dict({"sslmode": "require"})

        # hide_password=False is required — the default hides it behind
        # `***`, which would then become the literal (unusable) value
        # stored in settings.DATABASE_URL.
        return url.render_as_string(hide_password=False)

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
