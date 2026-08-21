"""Idempotent upsert-by-slug seeding — safe to call on every startup."""
from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.db.models.gtm_skill import (
    GtmCollection,
    GtmCollectionSkill,
    GtmSkill,
    GtmSkillRelation,
    GtmStage,
)
from app.seed.gtm_seed_data import COLLECTIONS, SKILL_RELATIONS, SKILLS, STAGES

logger = logging.getLogger(__name__)


def seed(db: Session) -> None:
    stage_by_slug: dict[str, GtmStage] = {}
    for row in STAGES:
        stage = db.query(GtmStage).filter(GtmStage.slug == row["slug"]).first()
        if stage is None:
            stage = GtmStage(slug=row["slug"])
            db.add(stage)
        stage.name = row["name"]
        stage.position = row["position"]
        stage.description = row["description"]
        stage.color = row["color"]
        stage_by_slug[row["slug"]] = stage
    db.flush()

    skill_by_slug: dict[str, GtmSkill] = {}
    for row in SKILLS:
        skill = db.query(GtmSkill).filter(GtmSkill.slug == row["slug"]).first()
        if skill is None:
            skill = GtmSkill(slug=row["slug"])
            db.add(skill)
        skill.title = row["title"]
        skill.stage_id = stage_by_slug[row["stage"]].id
        skill.execution_type = row["execution_type"]
        skill.status = row["status"]
        skill.roles = row["roles"]
        skill.categories = row["categories"]
        skill.icon = row["icon"]
        skill.is_featured = row["is_featured"]
        skill.short_description = row["short_description"]
        skill.when_to_use = row["when_to_use"]
        skill.inputs = row["inputs"]
        skill.workflow_steps = row["workflow_steps"]
        skill.outputs = row["outputs"]
        skill_by_slug[row["slug"]] = skill
    db.flush()

    for row in COLLECTIONS:
        collection = db.query(GtmCollection).filter(GtmCollection.slug == row["slug"]).first()
        if collection is None:
            collection = GtmCollection(slug=row["slug"])
            db.add(collection)
        collection.name = row["name"]
        collection.description = row["description"]
        collection.is_featured = row["is_featured"]
        collection.position = row["position"]
        db.flush()

        for position, skill_slug in enumerate(row["skills"]):
            skill = skill_by_slug[skill_slug]
            link = (
                db.query(GtmCollectionSkill)
                .filter(
                    GtmCollectionSkill.collection_id == collection.id,
                    GtmCollectionSkill.skill_id == skill.id,
                )
                .first()
            )
            if link is None:
                link = GtmCollectionSkill(collection_id=collection.id, skill_id=skill.id)
                db.add(link)
            link.position = position

    for slug_a, slug_b in SKILL_RELATIONS:
        skill_a = skill_by_slug[slug_a]
        skill_b = skill_by_slug[slug_b]
        for left, right in ((skill_a, skill_b), (skill_b, skill_a)):
            exists = (
                db.query(GtmSkillRelation)
                .filter(
                    GtmSkillRelation.skill_id == left.id,
                    GtmSkillRelation.related_skill_id == right.id,
                )
                .first()
            )
            if exists is None:
                db.add(GtmSkillRelation(skill_id=left.id, related_skill_id=right.id))

    db.commit()
    logger.info(
        "[seed] gtm skills seeded: %d stages, %d skills, %d collections",
        len(STAGES), len(SKILLS), len(COLLECTIONS),
    )
