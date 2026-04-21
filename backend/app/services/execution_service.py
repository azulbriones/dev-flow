"""Execution service - Execute workflows and manage executions."""

from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.execution import Execution
from ..models.workflow import Workflow
from ..schemas.execution import ExecutionCreate
from ..tasks.workflow import execute_workflow as celery_execute_workflow


def execute_workflow(
    db: Session,
    execution_data: ExecutionCreate,
) -> Execution:
    """Execute a workflow using Celery.

    Args:
        db: Database session.
        execution_data: Execution creation data.

    Returns:
        Created Execution object.
    """
    yaml_content: Optional[str] = execution_data.yaml
    workflow: Optional[Workflow] = None

    # Get YAML from workflow_id if provided
    if execution_data.workflow_id:
        workflow = (
            db.query(Workflow).filter(Workflow.id == execution_data.workflow_id).first()
        )
        if workflow:
            yaml_content = workflow.yaml_content

    if not yaml_content:
        raise ValueError("No workflow content provided")

    # Create execution record
    execution = Execution(
        workflow_id=execution_data.workflow_id or (workflow.id if workflow else 0),
        status="pending",
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    # Dispatch to Celery worker
    celery_execute_workflow.delay(execution.id, yaml_content)

    return execution


def list_executions(db: Session) -> List[Execution]:
    """List all executions.

    Args:
        db: Database session.

    Returns:
        List of Execution objects.
    """
    return db.query(Execution).order_by(Execution.started_at.desc()).all()


def get_execution(db: Session, execution_id: int) -> Optional[Execution]:
    """Get an execution by ID.

    Args:
        db: Database session.
        execution_id: Execution ID.

    Returns:
        Execution object or None.
    """
    return db.query(Execution).filter(Execution.id == execution_id).first()
