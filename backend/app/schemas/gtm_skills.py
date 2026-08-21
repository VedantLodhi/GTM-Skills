from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class StageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    position: int
    description: Optional[str] = None
    color: Optional[str] = None


class SkillListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    short_description: str
    stage: StageOut
    roles: list[str]
    categories: list[str]
    execution_type: str
    status: str
    icon: Optional[str] = None
    color: Optional[str] = None
    is_featured: bool


class WorkflowStep(BaseModel):
    title: str
    description: str


class IOField(BaseModel):
    label: str
    description: str


class SkillDetail(SkillListItem):
    when_to_use: str
    inputs: list[IOField]
    workflow_steps: list[WorkflowStep]
    outputs: list[IOField]
    related_skills: list[SkillListItem] = Field(default_factory=list)


class CollectionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    description: Optional[str] = None
    is_featured: bool
    skill_count: int


class CollectionDetail(CollectionListItem):
    skills: list[SkillListItem]


class RunSkillResponse(BaseModel):
    skill: SkillDetail
    run_id: UUID
    run_count: int


class BookmarkToggleResponse(BaseModel):
    skill_id: UUID
    bookmarked: bool


class WorkflowItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    position: int
    notes: Optional[str] = None
    skill: SkillListItem


class WorkflowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime
    items: list[WorkflowItemOut]


class WorkflowItemCreate(BaseModel):
    skill_id: UUID
    notes: Optional[str] = None


class WorkflowItemUpdate(BaseModel):
    position: Optional[int] = None
    notes: Optional[str] = None
