"""Listing, filtering, pagination, and detail — GET /api/skills, /api/skills/{slug}."""


def test_list_skills_returns_all_seeded_skills(client):
    r = client.get("/api/skills")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 16
    assert r.headers["X-Total-Count"] == "16"


def test_filter_by_stage(client):
    r = client.get("/api/skills", params={"stage": "qualification"})
    data = r.json()
    assert len(data) > 0
    assert all(s["stage"]["slug"] == "qualification" for s in data)


def test_filter_by_role(client):
    r = client.get("/api/skills", params={"role": "SDR"})
    data = r.json()
    assert len(data) > 0
    assert all("SDR" in s["roles"] for s in data)


def test_filter_by_category(client):
    r = client.get("/api/skills", params={"category": "Pricing"})
    data = r.json()
    assert len(data) > 0
    assert all("Pricing" in s["categories"] for s in data)


def test_filter_by_execution_type(client):
    r = client.get("/api/skills", params={"execution_type": "coming_soon"})
    data = r.json()
    assert len(data) == 2
    assert all(s["execution_type"] == "coming_soon" for s in data)


def test_filter_by_status(client):
    r = client.get("/api/skills", params={"status": "planned"})
    data = r.json()
    assert len(data) > 0
    assert all(s["status"] == "planned" for s in data)


def test_filter_by_featured(client):
    r = client.get("/api/skills", params={"featured": True})
    data = r.json()
    assert len(data) > 0
    assert all(s["is_featured"] for s in data)


def test_search_query_matches_title(client):
    r = client.get("/api/skills", params={"q": "ICP"})
    data = r.json()
    assert any(s["slug"] == "icp-definition-builder" for s in data)


def test_search_query_no_match_returns_empty_list(client):
    r = client.get("/api/skills", params={"q": "xyzzy-not-a-real-term"})
    assert r.status_code == 200
    assert r.json() == []


def test_pagination_returns_correct_page_and_headers(client):
    r1 = client.get("/api/skills", params={"page": 1, "limit": 5})
    assert r1.status_code == 200
    page1 = r1.json()
    assert len(page1) == 5
    assert r1.headers["X-Total-Count"] == "16"
    assert r1.headers["X-Page"] == "1"
    assert r1.headers["X-Limit"] == "5"
    assert r1.headers["X-Total-Pages"] == "4"

    r2 = client.get("/api/skills", params={"page": 2, "limit": 5})
    page2 = r2.json()
    assert len(page2) == 5
    assert {s["id"] for s in page1}.isdisjoint({s["id"] for s in page2})


def test_skill_detail_full_shape(client):
    r = client.get("/api/skills/icp-definition-builder")
    assert r.status_code == 200
    data = r.json()
    assert data["slug"] == "icp-definition-builder"
    assert data["when_to_use"]
    assert len(data["inputs"]) > 0
    assert len(data["workflow_steps"]) > 0
    assert len(data["outputs"]) > 0
    assert len(data["related_skills"]) > 0
    # related skills are the lightweight list shape, not full detail
    assert "when_to_use" not in data["related_skills"][0]


def test_skill_detail_404_for_unknown_slug(client):
    r = client.get("/api/skills/does-not-exist")
    assert r.status_code == 404
