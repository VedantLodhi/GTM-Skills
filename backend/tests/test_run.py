"""POST /api/skills/{slug}/run — persistence, run_count, and coming_soon → 409."""


def test_run_native_skill_persists_and_returns_detail(client, session_headers):
    slug = "icp-definition-builder"

    r1 = client.post(f"/api/skills/{slug}/run", headers=session_headers)
    assert r1.status_code == 200
    data1 = r1.json()
    assert data1["run_count"] == 1
    assert data1["skill"]["slug"] == slug
    assert data1["run_id"]

    r2 = client.post(f"/api/skills/{slug}/run", headers=session_headers)
    assert r2.json()["run_count"] == 2
    # Each run gets its own id — this isn't reusing/overwriting a row.
    assert r2.json()["run_id"] != data1["run_id"]


def test_run_method_only_skill_succeeds(client, session_headers):
    # method_only skills are still "runnable" (a read-only playbook) —
    # only coming_soon is blocked.
    r = client.post("/api/skills/discovery-call-question-bank/run", headers=session_headers)
    assert r.status_code == 200


def test_run_coming_soon_skill_returns_409(client, session_headers):
    r = client.post("/api/skills/deal-risk-signal-checklist/run", headers=session_headers)
    assert r.status_code == 409
    assert "coming soon" in r.json()["detail"].lower()


def test_run_requires_session_header(client):
    r = client.post("/api/skills/icp-definition-builder/run")
    assert r.status_code == 400


def test_run_missing_skill_404(client, session_headers):
    r = client.post("/api/skills/does-not-exist/run", headers=session_headers)
    assert r.status_code == 404
