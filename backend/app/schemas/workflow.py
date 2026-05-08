"""Workflow Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkflowCreate(BaseModel):
    """Schema for creating a workflow."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    yaml_content: str = Field(..., min_length=1)


class WorkflowResponse(BaseModel):
    """Schema for workflow response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    yaml_content: str
    created_at: datetime
    updated_at: datetime


class WorkflowListResponse(BaseModel):
    """Schema for workflow list response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
