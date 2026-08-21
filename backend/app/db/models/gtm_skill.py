"""GTM Skills Showcase — full schema (blueprint §8).

Standalone demo app: no OutMate models are imported or referenced. Content
tables (stages/skills/collections) are global; session-scoped tables
(bookmarks/workflows/runs) are keyed by a random `session_id` string
generated client-side — there is no user/auth table in this project.

Conventions (deliberately explicit constants, not native Postgres enums —
adding a new value later never needs a migration):
"""
from __future__ import annotations

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base

EXECUTION_TYPES = ("native", "assisted", "method_only", "coming_soon")
SKILL_STATUSES = ("beta", "live", "planned")

# "Sales Manager" added for the gtm-skills/gtm import — its role-bucketed
# prompts (salesManagerPrompts) don't fit any of the original 6 presets.
ROLE_PRESETS = ("SDR", "AE", "RevOps", "Marketing", "Founder", "CS", "Sales Manager")
CATEGORY_PRESETS = ("Email", "Calls", "Research", "Enablement", "Pricing", "Retention")


def _uuid_col(**kw):
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, **kw)


class GtmStage(Base):
    """One of the 7 GTM funnel stages. A real table (not a hardcoded enum)
    so stages stay content-editable without a migration."""

    __tablename__ = "gtm_stages"

    id = _uuid_col()
    slug = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    color = Column(String(32), nullable=True)  # hex or design-token name

    skills = relationship("GtmSkill", back_populates="stage")

    __table_args__ = (Index("ix_gtm_stages_position", "position"),)


class GtmSkill(Base):
    """One GTM skill / playbook card. Global content — no session_id."""

    __tablename__ = "gtm_skills"

    id = _uuid_col()
    slug = Column(String(160), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    stage_id = Column(UUID(as_uuid=True), ForeignKey("gtm_stages.id", ondelete="RESTRICT"), nullable=False, index=True)

    short_description = Column(String(500), nullable=False)
    when_to_use = Column(Text, nullable=False)

    # Each: {"label": str, "description": str}
    inputs = Column(JSONB, nullable=False, default=list)
    # Each: {"title": str, "description": str} — ordered, index = step number
    workflow_steps = Column(JSONB, nullable=False, default=list)
    # Each: {"label": str, "description": str}
    outputs = Column(JSONB, nullable=False, default=list)

    roles = Column(JSONB, nullable=False, default=list)        # subset of ROLE_PRESETS
    categories = Column(JSONB, nullable=False, default=list)   # subset of CATEGORY_PRESETS

    execution_type = Column(String(16), nullable=False, default="native", server_default="native")
    status = Column(String(16), nullable=False, default="live", server_default="live")

    icon = Column(String(64), nullable=True)   # lucide-react icon name
    color = Column(String(32), nullable=True)
    is_featured = Column(Boolean, nullable=False, default=False, server_default="false")

    # ── Imported-content fields (gtm-skills/gtm import) ──────────────────
    # All nullable/additive — stay NULL for the 16 hand-written skills.
    # content_body holds a raw copy-paste prompt template (source content
    # has no workflow_steps/inputs/outputs breakdown, so it isn't forced
    # into those fields — see RunSkillPanel's content_body branch).
    content_body = Column(Text, nullable=True)
    # The source record's own id (e.g. "saas-cold-email-1") — the
    # idempotency key the importer upserts on. Distinct from `slug`
    # (user/URL-facing) so slug can be hand-tuned later without breaking
    # re-import matching.
    source_id = Column(String(160), nullable=True, unique=True, index=True)
    source_url = Column(String(500), nullable=True)
    difficulty = Column(String(16), nullable=True)  # beginner | intermediate | advanced

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    stage = relationship("GtmStage", back_populates="skills")
    collection_links = relationship("GtmCollectionSkill", back_populates="skill", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_gtm_skills_stage_status", "stage_id", "status"),
        Index("ix_gtm_skills_execution_type", "execution_type"),
    )


class GtmCollection(Base):
    __tablename__ = "gtm_collections"

    id = _uuid_col()
    slug = Column(String(160), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_featured = Column(Boolean, nullable=False, default=False, server_default="false")
    position = Column(Integer, nullable=False, default=0)

    skill_links = relationship(
        "GtmCollectionSkill",
        back_populates="collection",
        cascade="all, delete-orphan",
        order_by="GtmCollectionSkill.position",
    )


class GtmCollectionSkill(Base):
    """Ordered join: which skills belong to which collection, and in what order."""

    __tablename__ = "gtm_collection_skills"

    id = _uuid_col()
    collection_id = Column(UUID(as_uuid=True), ForeignKey("gtm_collections.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("gtm_skills.id", ondelete="CASCADE"), nullable=False, index=True)
    position = Column(Integer, nullable=False, default=0)

    collection = relationship("GtmCollection", back_populates="skill_links")
    skill = relationship("GtmSkill", back_populates="collection_links")

    __table_args__ = (UniqueConstraint("collection_id", "skill_id", name="uq_collection_skill"),)


class GtmSkillRelation(Base):
    """Self-referential many-to-many: 'related skills' shown on a detail page."""

    __tablename__ = "gtm_skill_relations"

    id = _uuid_col()
    skill_id = Column(UUID(as_uuid=True), ForeignKey("gtm_skills.id", ondelete="CASCADE"), nullable=False, index=True)
    related_skill_id = Column(UUID(as_uuid=True), ForeignKey("gtm_skills.id", ondelete="CASCADE"), nullable=False, index=True)

    __table_args__ = (UniqueConstraint("skill_id", "related_skill_id", name="uq_skill_relation"),)


class GtmSkillBookmark(Base):
    __tablename__ = "gtm_skill_bookmarks"

    id = _uuid_col()
    session_id = Column(String(128), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("gtm_skills.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("session_id", "skill_id", name="uq_session_skill_bookmark"),)


class GtmWorkflow(Base):
    """A user's saved sequence of skills — a personal playbook, not an
    execution engine. Deliberately independent of any automation/run model."""

    __tablename__ = "gtm_workflows"

    id = _uuid_col()
    session_id = Column(String(128), nullable=False, index=True)
    name = Column(String(255), nullable=False, default="My Workflow")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    items = relationship(
        "GtmWorkflowItem",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="GtmWorkflowItem.position",
    )


class GtmWorkflowItem(Base):
    __tablename__ = "gtm_workflow_items"

    id = _uuid_col()
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("gtm_workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("gtm_skills.id", ondelete="CASCADE"), nullable=False, index=True)
    position = Column(Integer, nullable=False, default=0)
    notes = Column(String(1000), nullable=True)

    workflow = relationship("GtmWorkflow", back_populates="items")
    skill = relationship("GtmSkill")

    __table_args__ = (UniqueConstraint("workflow_id", "skill_id", name="uq_workflow_skill"),)


class GtmSkillRun(Base):
    """Lightweight usage signal recorded each time a visitor clicks "Run" on
    a skill — real persistence, not a fake counter."""

    __tablename__ = "gtm_skill_runs"

    id = _uuid_col()
    skill_id = Column(UUID(as_uuid=True), ForeignKey("gtm_skills.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(128), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (Index("ix_gtm_skill_runs_skill_created", "skill_id", "created_at"),)
