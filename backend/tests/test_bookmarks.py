"""Bookmark toggle (existing behavior, unchanged), GET /api/bookmarks, and
the additive DELETE endpoint."""


def test_bookmark_toggle_and_appears_in_list(client, session_headers):
    slug = "cold-email-sequence-writer"

    r1 = client.post(f"/api/skills/{slug}/bookmark", headers=session_headers)
    assert r1.status_code == 200
    assert r1.json()["bookmarked"] is True

    listed = client.get("/api/bookmarks", headers=session_headers).json()
    assert any(s["slug"] == slug for s in listed)

    r2 = client.post(f"/api/skills/{slug}/bookmark", headers=session_headers)
    assert r2.json()["bookmarked"] is False

    listed_after = client.get("/api/bookmarks", headers=session_headers).json()
    assert not any(s["slug"] == slug for s in listed_after)


def test_bookmarks_are_scoped_per_session(client, session_headers):
    slug = "lead-list-prioritizer"
    client.post(f"/api/skills/{slug}/bookmark", headers=session_headers)

    other_session = {"X-Session-Id": "a-completely-different-session"}
    listed = client.get("/api/bookmarks", headers=other_session).json()
    assert not any(s["slug"] == slug for s in listed)


def test_bookmark_requires_session_header(client):
    r = client.post("/api/skills/cold-email-sequence-writer/bookmark")
    assert r.status_code == 400


def test_bookmark_missing_skill_404(client, session_headers):
    r = client.post("/api/skills/does-not-exist/bookmark", headers=session_headers)
    assert r.status_code == 404


def test_delete_bookmark_is_idempotent(client, session_headers):
    slug = "lead-list-prioritizer"
    client.post(f"/api/skills/{slug}/bookmark", headers=session_headers)

    r1 = client.delete(f"/api/skills/{slug}/bookmark", headers=session_headers)
    assert r1.status_code == 204

    # Deleting again (already removed) is still a successful no-op.
    r2 = client.delete(f"/api/skills/{slug}/bookmark", headers=session_headers)
    assert r2.status_code == 204

    listed = client.get("/api/bookmarks", headers=session_headers).json()
    assert not any(s["slug"] == slug for s in listed)
