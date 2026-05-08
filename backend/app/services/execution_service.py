"""Execution service - Execute workflows and manage executions."""

from typing import List, Optional

import yaml

from sqlalchemy.orm import Session

from ..models.execution import Execution
from ..models.workflow import Workflow
from ..schemas.execution import ExecutionCreate
from ..tasks.workflow import execute_workflow as celery_execute_workflow
from .workflow_service import WorkflowValidationError


class WorkflowNotFoundError(Exception):
    """Raised when an execution references a missing workflow."""

    pass


def validate_workflow_yaml(yaml_content: str) -> dict[str, object]:
    """Parse and validate workflow YAML content.

    Args:
        yaml_content: Raw YAML content.

    Returns:
        Parsed workflow data.

    Raises:
        WorkflowValidationError: If the YAML structure is invalid.
    """
    try:
        workflow_data = yaml.safe_load(yaml_content)
    except yaml.YAMLError as exc:
        raise WorkflowValidationError(f"YAML inválido: {exc}")

    if not isinstance(workflow_data, dict):
        raise WorkflowValidationError(
            "El workflow debe ser un objeto YAML con claves name y steps"
        )

    if not workflow_data.get("name"):
        raise WorkflowValidationError("El campo 'name' es obligatorio")

    steps = workflow_data.get("steps")
    if not isinstance(steps, list):
        raise WorkflowValidationError("El campo 'steps' debe ser una lista")
    if not steps:
        raise WorkflowValidationError("Debe haber al menos un paso en el workflow")

    for i, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            raise WorkflowValidationError(f"El paso {i} debe ser un objeto YAML")
        if not step.get("name"):
            raise WorkflowValidationError(f"El paso {i} no tiene 'name' (obligatorio)")
        if not step.get("run"):
            raise WorkflowValidationError(f"El paso {i} no tiene 'run' (obligatorio)")

    return workflow_data


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
        if not workflow:
            raise WorkflowNotFoundError(
                f"Workflow {execution_data.workflow_id} not found"
            )

        yaml_content = workflow.yaml_content

    if not yaml_content:
        raise WorkflowValidationError("No workflow content provided")

    validate_workflow_yaml(yaml_content)

    # Create execution record
    execution = Execution(
        workflow_id=(execution_data.workflow_id or (workflow.id if workflow else None)),
        status="pending",
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    # Dispatch to Celery worker
    celery_execute_workflow.delay(execution.id, yaml_content)

    return execution


def list_executions(db: Session, workflow_id: Optional[int] = None) -> List[Execution]:
    """List all executions.

    Args:
        db: Database session.

    Returns:
        List of Execution objects.
    """
    query = db.query(Execution)
    if workflow_id is not None:
        query = query.filter(Execution.workflow_id == workflow_id)
    return query.order_by(Execution.started_at.desc()).all()


def get_execution(db: Session, execution_id: int) -> Optional[Execution]:
    """Get an execution by ID.

    Args:
        db: Database session.
        execution_id: Execution ID.

    Returns:
        Execution object or None.
    """
    return db.query(Execution).filter(Execution.id == execution_id).first()
