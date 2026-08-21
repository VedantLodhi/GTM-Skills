"""Business logic for the GTM Skills showcase — list/filter/search, detail,
collections, run/bookmark/workflow. Routes stay thin; this is where the
actual query composition lives."""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.db.models.gtm_skill import (
    GtmCollection,
    GtmCollectionSkill,
    GtmSkill,
    GtmSkillBookmark,
    GtmSkillRelation,
    GtmSkillRun,
    GtmStage,
    GtmWorkflow,
    GtmWorkflowItem,
)


class NotFoundError(Exception):
    pass


class DuplicateError(Exception):
    """Action would create a duplicate (e.g. a skill already in the workflow)."""


class ComingSoonError(Exception):
    """Action attempted on a skill whose execution_type is 'coming_soon'."""


def list_stages(db: Session) -> list[GtmStage]:
    return db.query(GtmStage).order_by(GtmStage.position).all()


def list_skills(
    db: Session,
    stage: Optional[str] = None,
    role: Optional[str] = None,
    category: Optional[str] = None,
    execution_type: Optional[str] = None,
    status: Optional[str] = None,
    featured: Optional[bool] = None,
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[GtmSkill], int]:
    """Returns (page_of_skills, total_matching_count) — the same filtered
    query is reused for both, so the count can never drift from the page."""
    query = db.query(GtmSkill).options(joinedload(GtmSkill.stage)).join(GtmStage)

    if stage:
        query = query.filter(GtmStage.slug == stage)
    if execution_type:
        query = query.filter(GtmSkill.execution_type == execution_type)
    if status:
        query = query.filter(GtmSkill.status == status)
    if featured is not None:
        query = query.filter(GtmSkill.is_featured.is_(featured))
    if role:
        # roles is a JSONB array — Postgres containment check.
        query = query.filter(GtmSkill.roles.contains([role]))
    if category:
        query = query.filter(GtmSkill.categories.contains([category]))
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(GtmSkill.title.ilike(like), GtmSkill.short_description.ilike(like))
        )

    total = query.with_entities(func.count(GtmSkill.id)).scalar() or 0
    items = query.order_by(GtmStage.position, GtmSkill.title).limit(limit).offset(offset).all()
    return items, int(total)


def get_skill_by_slug(db: Session, slug: str) -> GtmSkill:
    skill = (
        db.query(GtmSkill)
        .options(joinedload(GtmSkill.stage))
        .filter(GtmSkill.slug == slug)
        .first()
    )
    if skill is None:
        raise NotFoundError(f"Skill '{slug}' not found")
    return skill


def get_related_skills(db: Session, skill_id: uuid.UUID) -> list[GtmSkill]:
    related_ids = [
        row.related_skill_id
        for row in db.query(GtmSkillRelation).filter(GtmSkillRelation.skill_id == skill_id).all()
    ]
    if not related_ids:
        return []
    return (
        db.query(GtmSkill)
        .options(joinedload(GtmSkill.stage))
        .filter(GtmSkill.id.in_(related_ids))
        .all()
    )


def list_collections(db: Session) -> list[tuple[GtmCollection, int]]:
    counts = dict(
        db.query(GtmCollectionSkill.collection_id, func.count(GtmCollectionSkill.id))
        .group_by(GtmCollectionSkill.collection_id)
        .all()
    )
    collections = db.query(GtmCollection).order_by(GtmCollection.position).all()
    return [(c, counts.get(c.id, 0)) for c in collections]


def get_collection_by_slug(db: Session, slug: str) -> tuple[GtmCollection, list[GtmSkill]]:
    collection = db.query(GtmCollection).filter(GtmCollection.slug == slug).first()
    if collection is None:
        raise NotFoundError(f"Collection '{slug}' not found")
    links = (
        db.query(GtmCollectionSkill)
        .options(joinedload(GtmCollectionSkill.skill).joinedload(GtmSkill.stage))
        .filter(GtmCollectionSkill.collection_id == collection.id)
        .order_by(GtmCollectionSkill.position)
        .all()
    )
    return collection, [link.skill for link in links]


def record_run(db: Session, skill: GtmSkill, session_id: str) -> tuple[GtmSkillRun, int]:
    if skill.execution_type == "coming_soon":
        raise ComingSoonError(f"Skill '{skill.slug}' is coming soon and can't be run yet")

    run = GtmSkillRun(skill_id=skill.id, session_id=session_id)
    db.add(run)
    db.commit()
    db.refresh(run)
    run_count = db.query(func.count(GtmSkillRun.id)).filter(GtmSkillRun.skill_id == skill.id).scalar()
    return run, int(run_count or 0)


def toggle_bookmark(db: Session, skill: GtmSkill, session_id: str) -> bool:
    existing = (
        db.query(GtmSkillBookmark)
        .filter(GtmSkillBookmark.session_id == session_id, GtmSkillBookmark.skill_id == skill.id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(GtmSkillBookmark(session_id=session_id, skill_id=skill.id))
    db.commit()
    return True


def remove_bookmark(db: Session, skill: GtmSkill, session_id: str) -> bool:
    """Idempotent delete — returns whether a row was actually removed.
    Additive alongside toggle_bookmark (used by POST); the existing toggle
    endpoint is untouched."""
    existing = (
        db.query(GtmSkillBookmark)
        .filter(GtmSkillBookmark.session_id == session_id, GtmSkillBookmark.skill_id == skill.id)
        .first()
    )
    if existing is None:
        return False
    db.delete(existing)
    db.commit()
    return True


def list_bookmarks(db: Session, session_id: str) -> list[GtmSkill]:
    return (
        db.query(GtmSkill)
        .options(joinedload(GtmSkill.stage))
        .join(GtmSkillBookmark, GtmSkillBookmark.skill_id == GtmSkill.id)
        .filter(GtmSkillBookmark.session_id == session_id)
        .order_by(GtmSkillBookmark.created_at.desc())
        .all()
    )


def get_or_create_workflow(db: Session, session_id: str) -> GtmWorkflow:
    workflow = (
        db.query(GtmWorkflow)
        .options(joinedload(GtmWorkflow.items).joinedload(GtmWorkflowItem.skill).joinedload(GtmSkill.stage))
        .filter(GtmWorkflow.session_id == session_id)
        .first()
    )
    if workflow is None:
        workflow = GtmWorkflow(session_id=session_id, name="My Workflow")
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
    return workflow


def add_workflow_item(db: Session, session_id: str, skill_id: uuid.UUID, notes: Optional[str]) -> GtmWorkflow:
    workflow = get_or_create_workflow(db, session_id)
    existing = (
        db.query(GtmWorkflowItem)
        .filter(GtmWorkflowItem.workflow_id == workflow.id, GtmWorkflowItem.skill_id == skill_id)
        .first()
    )
    if existing is not None:
        raise DuplicateError("This skill is already in your workflow")

    next_position = (
        db.query(func.coalesce(func.max(GtmWorkflowItem.position), -1))
        .filter(GtmWorkflowItem.workflow_id == workflow.id)
        .scalar()
    )
    db.add(GtmWorkflowItem(workflow_id=workflow.id, skill_id=skill_id, position=next_position + 1, notes=notes))
    db.commit()
    # get_or_create_workflow() was already called above in this same
    # session — its `workflow.items` collection is now loaded and stale
    # relative to the insert just committed. SQLAlchemy won't refresh an
    # already-loaded collection on a plain re-query, so expire it first or
    # the response would omit the item that was just added.
    db.expire_all()
    return get_or_create_workflow(db, session_id)


def update_workflow_item(
    db: Session, session_id: str, item_id: uuid.UUID, position: Optional[int], notes: Optional[str]
) -> GtmWorkflow:
    workflow = get_or_create_workflow(db, session_id)
    item = db.query(GtmWorkflowItem).filter(
        GtmWorkflowItem.id == item_id, GtmWorkflowItem.workflow_id == workflow.id
    ).first()
    if item is None:
        raise NotFoundError("Workflow item not found")
    if position is not None:
        item.position = position
    if notes is not None:
        item.notes = notes
    db.commit()
    db.expire_all()  # see add_workflow_item — same stale-collection reason
    return get_or_create_workflow(db, session_id)


def delete_workflow_item(db: Session, session_id: str, item_id: uuid.UUID) -> GtmWorkflow:
    workflow = get_or_create_workflow(db, session_id)
    item = db.query(GtmWorkflowItem).filter(
        GtmWorkflowItem.id == item_id, GtmWorkflowItem.workflow_id == workflow.id
    ).first()
    if item is None:
        raise NotFoundError("Workflow item not found")
    db.delete(item)
    db.commit()
    db.expire_all()  # see add_workflow_item — same stale-collection reason
    return get_or_create_workflow(db, session_id)
