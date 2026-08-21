"""Import all model modules so Base.metadata / Alembic autogenerate sees every table."""
from app.db.models.gtm_skill import (  # noqa: F401
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
