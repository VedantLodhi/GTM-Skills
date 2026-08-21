"""GTM Skills Showcase — all endpoints (blueprint §9).

Read endpoints are public (no session required). Personalization endpoints
(bookmark, workflow, run) require the X-Session-Id header via
`get_session_id` — an anonymous demo-session id, not real auth.
"""
from __future__ import annotations

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_session_id
from app.db.deps import get_db
from app.schemas.gtm_skills import (
    BookmarkToggleResponse,
    CollectionDetail,
    CollectionListItem,
    RunSkillResponse,
    SkillDetail,
    SkillListItem,
    StageOut,
    WorkflowItemCreate,
    WorkflowItemUpdate,
    WorkflowOut,
)
from app.services import gtm_skills_service as svc

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["gtm-skills"])


@router.get("/health")
def get_health():
    """Alias of the root /health for frontend/API path consistency
    (every other route lives under /api/*)."""
    return {"status": "ok", "service": "gtm-skills-showcase-api"}


@router.get("/stages", response_model=list[StageOut])
def get_stages(db: Session = Depends(get_db)):
    return svc.list_stages(db)


@router.get("/skills", response_model=list[SkillListItem])
def get_skills(
    response: Response,
    stage: Optional[str] = None,
    role: Optional[str] = None,
    category: Optional[str] = None,
    execution_type: Optional[str] = None,
    status: Optional[str] = None,
    featured: Optional[bool] = None,
    q: Optional[str] = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Response body stays a plain SkillListItem[] (unchanged shape, so the
    existing frontend client keeps working unmodified); pagination metadata
    rides on response headers instead of wrapping the body."""
    offset = (page - 1) * limit
    items, total = svc.list_skills(
        db,
        stage=stage,
        role=role,
        category=category,
        execution_type=execution_type,
        status=status,
        featured=featured,
        q=q,
        limit=limit,
        offset=offset,
    )
    total_pages = (total + limit - 1) // limit if limit else 0
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(page)
    response.headers["X-Limit"] = str(limit)
    response.headers["X-Total-Pages"] = str(total_pages)
    return items


def _build_skill_detail(db: Session, skill) -> SkillDetail:
    related = svc.get_related_skills(db, skill.id)
    return SkillDetail(
        **SkillListItem.model_validate(skill).model_dump(),
        when_to_use=skill.when_to_use,
        inputs=skill.inputs,
        workflow_steps=skill.workflow_steps,
        outputs=skill.outputs,
        related_skills=[SkillListItem.model_validate(s) for s in related],
        content_body=skill.content_body,
        source_url=skill.source_url,
        difficulty=skill.difficulty,
    )


@router.get("/skills/{slug}", response_model=SkillDetail)
def get_skill_detail(slug: str, db: Session = Depends(get_db)):
    try:
        skill = svc.get_skill_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return _build_skill_detail(db, skill)


@router.get("/collections", response_model=list[CollectionListItem])
def get_collections(db: Session = Depends(get_db)):
    return [
        CollectionListItem(
            id=c.id, slug=c.slug, name=c.name, description=c.description,
            is_featured=c.is_featured, skill_count=count,
        )
        for c, count in svc.list_collections(db)
    ]


@router.get("/collections/{slug}", response_model=CollectionDetail)
def get_collection_detail(slug: str, db: Session = Depends(get_db)):
    try:
        collection, skills = svc.get_collection_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return CollectionDetail(
        id=collection.id, slug=collection.slug, name=collection.name,
        description=collection.description, is_featured=collection.is_featured,
        skill_count=len(skills), skills=[SkillListItem.model_validate(s) for s in skills],
    )


@router.post("/skills/{slug}/run", response_model=RunSkillResponse)
def run_skill(slug: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    try:
        skill = svc.get_skill_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    try:
        run, run_count = svc.record_run(db, skill, session_id)
    except svc.ComingSoonError as exc:
        # 409: the request is well-formed, but the skill's current state
        # (coming_soon) conflicts with the "run" action.
        raise HTTPException(status_code=409, detail=str(exc))
    detail = _build_skill_detail(db, skill)
    return RunSkillResponse(skill=detail, run_id=run.id, run_count=run_count)


@router.get("/bookmarks", response_model=list[SkillListItem])
def get_bookmarks(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    return svc.list_bookmarks(db, session_id)


@router.post("/skills/{slug}/bookmark", response_model=BookmarkToggleResponse)
def bookmark_skill(slug: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    """Unchanged toggle behavior — the existing bookmark button keeps working
    exactly as before. DELETE below is a separate, additive convenience for
    clients that want an explicit "remove" call instead of a toggle."""
    try:
        skill = svc.get_skill_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    bookmarked = svc.toggle_bookmark(db, skill, session_id)
    return BookmarkToggleResponse(skill_id=skill.id, bookmarked=bookmarked)


@router.delete("/skills/{slug}/bookmark", status_code=204)
def delete_bookmark(slug: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    try:
        skill = svc.get_skill_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    svc.remove_bookmark(db, skill, session_id)  # idempotent — 204 either way
    return Response(status_code=204)


@router.get("/workflow", response_model=WorkflowOut)
def get_workflow(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    return svc.get_or_create_workflow(db, session_id)


@router.post("/workflow/items", response_model=WorkflowOut)
def add_workflow_item(
    payload: WorkflowItemCreate, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)
):
    try:
        return svc.add_workflow_item(db, session_id, payload.skill_id, payload.notes)
    except svc.DuplicateError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.patch("/workflow/items/{item_id}", response_model=WorkflowOut)
def update_workflow_item(
    item_id: UUID,
    payload: WorkflowItemUpdate,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id),
):
    try:
        return svc.update_workflow_item(db, session_id, item_id, payload.position, payload.notes)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.delete("/workflow/items/{item_id}", response_model=WorkflowOut)
def delete_workflow_item(item_id: UUID, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    try:
        return svc.delete_workflow_item(db, session_id, item_id)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
