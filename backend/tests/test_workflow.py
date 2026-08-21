"""Workflow add/remove, reorder, and duplicate-prevention (POST → 409)."""


def _get_skill(client, slug: str) -> dict:
    return client.get(f"/api/skills/{slug}").json()


def test_workflow_add_list_remove(client, session_headers):
    skill = _get_skill(client, "icp-definition-builder")

    add = client.post("/api/workflow/items", json={"skill_id": skill["id"]}, headers=session_headers)
    assert add.status_code == 200
    data = add.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["skill"]["slug"] == "icp-definition-builder"
    item_id = data["items"][0]["id"]

    fetched = client.get("/api/workflow", headers=session_headers).json()
    assert len(fetched["items"]) == 1

    removed = client.delete(f"/api/workflow/items/{item_id}", headers=session_headers)
    assert removed.status_code == 200
    assert len(removed.json()["items"]) == 0


def test_workflow_duplicate_skill_returns_409(client, session_headers):
    skill = _get_skill(client, "icp-definition-builder")

    first = client.post("/api/workflow/items", json={"skill_id": skill["id"]}, headers=session_headers)
    assert first.status_code == 200

    second = client.post("/api/workflow/items", json={"skill_id": skill["id"]}, headers=session_headers)
    assert second.status_code == 409

    # Confirm the duplicate attempt didn't sneak a second row in anyway.
    fetched = client.get("/api/workflow", headers=session_headers).json()
    assert len(fetched["items"]) == 1


def test_workflow_update_position_and_notes(client, session_headers):
    skill_a = _get_skill(client, "icp-definition-builder")
    skill_b = _get_skill(client, "cold-email-sequence-writer")

    client.post("/api/workflow/items", json={"skill_id": skill_a["id"]}, headers=session_headers)
    add_b = client.post("/api/workflow/items", json={"skill_id": skill_b["id"]}, headers=session_headers).json()
    item_b_id = next(i["id"] for i in add_b["items"] if i["skill"]["slug"] == "cold-email-sequence-writer")

    patched = client.patch(
        f"/api/workflow/items/{item_b_id}",
        json={"position": 0, "notes": "start here"},
        headers=session_headers,
    )
    assert patched.status_code == 200
    item_b = next(i for i in patched.json()["items"] if i["id"] == item_b_id)
    assert item_b["position"] == 0
    assert item_b["notes"] == "start here"


def test_workflow_requires_session_header(client):
    r = client.get("/api/workflow")
    assert r.status_code == 400


def test_workflow_remove_unknown_item_404(client, session_headers):
    r = client.delete("/api/workflow/items/00000000-0000-0000-0000-000000000000", headers=session_headers)
    assert r.status_code == 404
