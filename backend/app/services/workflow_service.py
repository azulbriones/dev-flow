"""Workflow service - CRUD operations."""

from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.workflow import Workflow
from ..schemas.workflow import WorkflowCreate


class WorkflowValidationError(Exception):
    """Raised when workflow data fails validation."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


def _normalize_workflow_name(name: str) -> str:
    """Normalize workflow names before persistence."""
    return name.strip()


def list_workflows(db: Session) -> List[Workflow]:
    """List all workflows.

    Args:
        db: Database session.

    Returns:
        List of Workflow objects.
    """
    return db.query(Workflow).order_by(Workflow.created_at.desc()).all()


def get_workflow(db: Session, workflow_id: int) -> Optional[Workflow]:
    """Get a workflow by ID.

    Args:
        db: Database session.
        workflow_id: Workflow ID.

    Returns:
        Workflow object or None.
    """
    return db.query(Workflow).filter(Workflow.id == workflow_id).first()


def create_workflow(db: Session, workflow_data: WorkflowCreate) -> Workflow:
    """Create a new workflow.

    Args:
        db: Database session.
        workflow_data: Workflow creation data.

    Returns:
        Created Workflow object.
    """
    name = _normalize_workflow_name(workflow_data.name)
    if not name:
        raise WorkflowValidationError("Workflow name is required")

    db_workflow = Workflow(
        name=name,
        description=workflow_data.description,
        yaml_content=workflow_data.yaml_content,
    )
    db.add(db_workflow)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise WorkflowValidationError(
            f"Workflow name '{name}' already exists",
            409,
        ) from exc
    db.refresh(db_workflow)
    return db_workflow


def delete_workflow(db: Session, workflow_id: int) -> bool:
    """Delete a workflow and its executions.

    Args:
        db: Database session.
        workflow_id: Workflow ID.

    Returns:
        True if deleted, False if not found.
    """
    workflow = get_workflow(db, workflow_id)
    if not workflow:
        return False

    # Delete executions first (SQLite doesn't enforce CASCADE without PRAGMA)
    for execution in workflow.executions:
        db.delete(execution)

    db.delete(workflow)
    db.commit()
    return True


def update_workflow(
    db: Session,
    workflow_id: int,
    workflow_data: WorkflowCreate,
) -> Optional[Workflow]:
    """Update a workflow.

    Args:
        db: Database session.
        workflow_id: Workflow ID.
        workflow_data: Updated workflow data.

    Returns:
        Updated Workflow object or None if not found.
    """
    workflow = get_workflow(db, workflow_id)
    if not workflow:
        return None

    name = _normalize_workflow_name(workflow_data.name)
    if not name:
        raise WorkflowValidationError("Workflow name is required")

    workflow.name = name
    workflow.description = workflow_data.description
    workflow.yaml_content = workflow_data.yaml_content

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise WorkflowValidationError(
            f"Workflow name '{name}' already exists",
            409,
        ) from exc
    db.refresh(workflow)
    return workflow
