"""Anonymous-session dependency.

This is a public showcase, not a multi-tenant SaaS — there is no login.
Personalization (bookmarks, saved workflow) is scoped to a random session
id the frontend generates in localStorage and sends as `X-Session-Id`.
This is NOT an auth boundary — treat all session-scoped data as
demo-quality, never anything sensitive.
"""
from fastapi import Header, HTTPException


def get_session_id(x_session_id: str | None = Header(default=None)) -> str:
    if not x_session_id or len(x_session_id) > 128:
        raise HTTPException(status_code=400, detail="Missing or invalid X-Session-Id header")
    return x_session_id
