"""Workflow service - CRUD operations."""

from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.workflow import Workflow
from ..schemas.workflow import WorkflowCreate


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
    db_workflow = Workflow(
        name=workflow_data.name,
        description=workflow_data.description,
        yaml_content=workflow_data.yaml_content,
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


def delete_workflow(db: Session, workflow_id: int) -> bool:
    """Delete a workflow.

    Args:
        db: Database session.
        workflow_id: Workflow ID.

    Returns:
        True if deleted, False if not found.
    """
    workflow = get_workflow(db, workflow_id)
    if workflow:
        db.delete(workflow)
        db.commit()
        return True
    return False
