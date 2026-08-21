"""Manually-invoked importer for gtm-skills/gtm's curated prompt library.

Source: https://github.com/gtm-skills/gtm — src/lib/prompts.ts (MIT licensed).

Reads the LOCAL JSON snapshot at
backend/app/seed/source_snapshots/gtm_skills_repo_prompts_snapshot.json,
extracted offline from a local clone of the upstream repo (see that file's
own `source_repo`/`source_file`/`extracted_at` header fields for
provenance). This script never touches the network and is never invoked
from app startup — `app/main.py` only ever calls the hand-written
`app.seed.seed.seed()`. The app must keep booting with zero internet
dependency; refreshing the snapshot is a separate, manual, offline step.

Usage (from Backend/):
    python -m app.seed.import_gtm_skills_repo            # writes to the DB
    python -m app.seed.import_gtm_skills_repo --dry-run   # report only

Idempotent: every record is upserted by `GtmSkill.source_id` (not `slug`,
so a slug can be hand-tuned later without breaking re-import matching).
Re-running against an unchanged snapshot creates zero new rows.

Mapping decisions (full rationale in the inspection report):
- Only records with a source `subcategory` (outreach/discovery/objections/
  proposals/follow-up) get a stage — mapped via SUBCATEGORY_TO_STAGE_SLUG.
  "strategy" is deliberately left unmapped (ambiguous). Everything else
  (no subcategory at all — the industry/role/workflow/methodology/universal
  majority of the corpus) falls back to the "uncategorized" stage. No
  stage is ever guessed from the source array/category name.
- Only records pulled from a role-bucketed array (category is literally a
  role slug) get a `roles` tag — everyone else imports with roles=[].
- Source `tags` are copied verbatim into `categories` — not remapped onto
  the hand-written skills' 6-value CATEGORY_PRESETS convention.
- `content_body` holds the raw prompt template; `inputs`/`workflow_steps`/
  `outputs` stay empty for imported records (no source equivalent — never
  synthesized).
- `execution_type = "method_only"` — these are copy-paste-yourself
  templates, matching this codebase's own definition of that value.
- `status = "live"` — the imported content is complete, not a draft.
"""
from __future__ import annotations

import argparse
import json
import logging
import re
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.db.models.gtm_skill import GtmSkill, GtmStage
from app.db.session import SessionLocal
from app.seed.seed import seed as seed_hand_written_content

logger = logging.getLogger(__name__)

SNAPSHOT_PATH = Path(__file__).parent / "source_snapshots" / "gtm_skills_repo_prompts_snapshot.json"

SUBCATEGORY_TO_STAGE_SLUG = {
    "outreach": "outreach-engagement",
    "discovery": "qualification",   # matches this app's own discovery-call-question-bank
    "objections": "qualification",  # matches this app's own objection-handling-playbook
    "proposals": "negotiation-closing",
    "follow-up": "outreach-engagement",
    # "strategy" intentionally omitted — not unambiguous enough to map.
}
FALLBACK_STAGE_SLUG = "uncategorized"

CATEGORY_TO_ROLE_NAME = {
    "sdr": "SDR",
    "ae": "AE",
    "sales-manager": "Sales Manager",
    "founder": "Founder",
    "revops": "RevOps",
    "csm": "CS",
}

EXECUTION_TYPE_FOR_IMPORTED = "method_only"
STATUS_FOR_IMPORTED = "live"


def _slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.strip().lower())
    return s.strip("-")


def _unique_slug(db: Session, base_slug: str) -> str:
    slug = base_slug
    n = 2
    while db.query(GtmSkill.id).filter(GtmSkill.slug == slug).first() is not None:
        slug = f"{base_slug}-{n}"
        n += 1
    return slug


def _load_snapshot() -> dict[str, Any]:
    with open(SNAPSHOT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _dedupe_by_id(records: list[dict]) -> tuple[list[dict], list[str]]:
    """Keep the first occurrence of each `id`, in source file order."""
    seen: set[str] = set()
    unique: list[dict] = []
    skipped: list[str] = []
    for r in records:
        rid = r["id"]
        if rid in seen:
            skipped.append(rid)
            continue
        seen.add(rid)
        unique.append(r)
    return unique, skipped


def _resolve_stage(db: Session, record: dict, cache: dict[str, GtmStage]) -> tuple[Any, bool]:
    stage_slug = SUBCATEGORY_TO_STAGE_SLUG.get(record.get("subcategory"), FALLBACK_STAGE_SLUG)
    if stage_slug not in cache:
        stage = db.query(GtmStage).filter(GtmStage.slug == stage_slug).first()
        if stage is None:
            raise RuntimeError(f"Stage '{stage_slug}' not found — seed() should have created it")
        cache[stage_slug] = stage
    return cache[stage_slug].id, stage_slug == FALLBACK_STAGE_SLUG


def _resolve_roles(record: dict) -> list[str]:
    role_name = CATEGORY_TO_ROLE_NAME.get(record.get("category"))
    return [role_name] if role_name else []


def import_records(db: Session, dry_run: bool = False) -> dict[str, Any]:
    snapshot = _load_snapshot()
    raw_records = snapshot["records"]
    source_url = snapshot["source_url"]

    unique_records, skipped_duplicate_ids = _dedupe_by_id(raw_records)

    existing_before_import = db.query(GtmSkill).count()
    hand_written_count_before = db.query(GtmSkill).filter(GtmSkill.source_id.is_(None)).count()

    stage_cache: dict[str, GtmStage] = {}
    imported_new = 0
    updated_existing = 0
    failed: list[dict[str, str]] = []
    uncategorized_count = 0
    with_role_count = 0
    with_subcategory_count = 0

    for record in unique_records:
        source_id = record.get("id", "?")
        try:
            if record.get("subcategory"):
                with_subcategory_count += 1

            stage_id, is_uncategorized = _resolve_stage(db, record, stage_cache)
            if is_uncategorized:
                uncategorized_count += 1

            roles = _resolve_roles(record)
            if roles:
                with_role_count += 1

            existing = db.query(GtmSkill).filter(GtmSkill.source_id == source_id).first()

            if dry_run:
                if existing is None:
                    imported_new += 1
                else:
                    updated_existing += 1
                continue

            # A SAVEPOINT per record: if this one record's flush fails (e.g.
            # a future upstream schema surprise), only its own change rolls
            # back — every record already committed to this transaction
            # stays intact, and the loop continues cleanly for the rest.
            with db.begin_nested():
                if existing is not None:
                    skill = existing
                else:
                    skill = GtmSkill(slug=_unique_slug(db, _slugify(source_id)), source_id=source_id)
                    db.add(skill)

                description = record["description"]
                skill.title = record["title"]
                skill.short_description = description
                # No source field maps to when_to_use — reuse the real
                # source description verbatim rather than inventing copy.
                skill.when_to_use = description
                skill.content_body = record["prompt"]
                skill.source_url = source_url
                skill.difficulty = record.get("difficulty")
                skill.stage_id = stage_id
                skill.roles = roles
                skill.categories = record.get("tags") or []
                skill.inputs = []
                skill.workflow_steps = []
                skill.outputs = []
                skill.execution_type = EXECUTION_TYPE_FOR_IMPORTED
                skill.status = STATUS_FOR_IMPORTED
                skill.is_featured = False
                db.flush()

            if existing is not None:
                updated_existing += 1
            else:
                imported_new += 1
        except Exception as exc:  # noqa: BLE001 — one bad record must not abort the whole run
            failed.append({"id": source_id, "error": str(exc)})
            logger.exception("Failed to import record %s", source_id)

    if not dry_run:
        db.commit()

    final_total_skills = db.query(GtmSkill).count() if not dry_run else None

    return {
        "existing_skills_before_import": existing_before_import,
        "hand_written_skills_before_import": hand_written_count_before,
        "raw_records_in_snapshot": len(raw_records),
        "unique_records_after_dedup": len(unique_records),
        "skipped_duplicate_ids": skipped_duplicate_ids,
        "imported_new": imported_new,
        "updated_existing": updated_existing,
        "failed_count": len(failed),
        "failed": failed,
        "uncategorized_count": uncategorized_count,
        "with_source_role_count": with_role_count,
        "with_source_subcategory_count": with_subcategory_count,
        "final_total_skills": final_total_skills,
        "dry_run": dry_run,
    }


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description="Import the gtm-skills/gtm prompt library into GtmSkill")
    parser.add_argument("--dry-run", action="store_true", help="Report what would happen without writing to the DB")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        # Idempotent — guarantees stages (including "uncategorized") and
        # the 16 hand-written skills exist before this import runs.
        seed_hand_written_content(db)
        report = import_records(db, dry_run=args.dry_run)
    finally:
        db.close()

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
