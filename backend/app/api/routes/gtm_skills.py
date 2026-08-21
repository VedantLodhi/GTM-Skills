"""GTM Skills Showcase — all endpoints (blueprint §9).

Read endpoints are public (no session required). Personalization endpoints
(bookmark, workflow, run) require the X-Session-Id header via
`get_session_id` — an anonymous demo-session id, not real auth.
"""
from __future__ import annotations

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
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


@router.get("/stages", response_model=list[StageOut])
def get_stages(db: Session = Depends(get_db)):
    return svc.list_stages(db)


@router.get("/skills", response_model=list[SkillListItem])
def get_skills(
    stage: Optional[str] = None,
    role: Optional[str] = None,
    category: Optional[str] = None,
    execution_type: Optional[str] = None,
    q: Optional[str] = Query(default=None, max_length=200),
    db: Session = Depends(get_db),
):
    return svc.list_skills(db, stage=stage, role=role, category=category, execution_type=execution_type, q=q)


@router.get("/skills/{slug}", response_model=SkillDetail)
def get_skill_detail(slug: str, db: Session = Depends(get_db)):
    try:
        skill = svc.get_skill_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    related = svc.get_related_skills(db, skill.id)
    return SkillDetail(
        **SkillListItem.model_validate(skill).model_dump(),
        when_to_use=skill.when_to_use,
        inputs=skill.inputs,
        workflow_steps=skill.workflow_steps,
        outputs=skill.outputs,
        related_skills=[SkillListItem.model_validate(s) for s in related],
    )


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
    if skill.execution_type == "coming_soon":
        raise HTTPException(status_code=400, detail="This skill is coming soon and can't be run yet.")
    run, run_count = svc.record_run(db, skill, session_id)
    related = svc.get_related_skills(db, skill.id)
    detail = SkillDetail(
        **SkillListItem.model_validate(skill).model_dump(),
        when_to_use=skill.when_to_use,
        inputs=skill.inputs,
        workflow_steps=skill.workflow_steps,
        outputs=skill.outputs,
        related_skills=[SkillListItem.model_validate(s) for s in related],
    )
    return RunSkillResponse(skill=detail, run_id=run.id, run_count=run_count)


@router.post("/skills/{slug}/bookmark", response_model=BookmarkToggleResponse)
def bookmark_skill(slug: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    try:
        skill = svc.get_skill_by_slug(db, slug)
    except svc.NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    bookmarked = svc.toggle_bookmark(db, skill, session_id)
    return BookmarkToggleResponse(skill_id=skill.id, bookmarked=bookmarked)


@router.get("/workflow", response_model=WorkflowOut)
def get_workflow(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    return svc.get_or_create_workflow(db, session_id)


@router.post("/workflow/items", response_model=WorkflowOut)
def add_workflow_item(
    payload: WorkflowItemCreate, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)
):
    return svc.add_workflow_item(db, session_id, payload.skill_id, payload.notes)


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
