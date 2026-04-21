"""Execution Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExecutionCreate(BaseModel):
    """Schema for creating an execution."""

    yaml: Optional[str] = Field(None, description="YAML content to execute")
    workflow_id: Optional[int] = Field(None, description="ID of saved workflow")


class ExecutionResponse(BaseModel):
    """Schema for execution response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_id: int
    status: str
    output: Optional[str]
    result: Optional[str]
    error_message: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]
