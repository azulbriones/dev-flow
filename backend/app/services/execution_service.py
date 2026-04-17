"""Execution service - Execute workflows and manage executions."""

import threading
from datetime import datetime
from queue import Queue
from typing import List, Optional

import yaml
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.execution import Execution
from ..models.workflow import Workflow
from ..schemas.execution import ExecutionCreate

# Global queues for output streaming (thread-safe)
# Pattern: Direct Push - service puts in queue, route polls from queue
execution_queues: dict[int, Queue] = {}


def run_workflow_in_background(
    execution_id: int,
    yaml_content: str,
    output_queue: Queue,
) -> None:
    """Run workflow in background thread.

    Creates its own DB session (not the HTTP request session).

    Args:
        execution_id: Execution ID.
        yaml_content: YAML content to execute.
        output_queue: Queue for streaming output.
    """
    import sys
    from pathlib import Path

    # Add CLI to path
    cli_path = Path(__file__).parent.parent.parent.parent / "cli" / "src"
    if str(cli_path) not in sys.path:
        sys.path.insert(0, str(cli_path))

    from devflow import Workflow as DevflowWorkflow
    from devflow import run_workflow
    from devflow.models import ExecutionError, WorkflowCycleError

    # Create NEW session for this thread
    db = SessionLocal()

    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if not execution:
        return

    # Update status to running
    execution.status = "running"
    db.commit()

    # Use queue passed from execute_workflow (already created)
    output_lines: List[str] = []

    def output_handler(line: str) -> None:
        """Output handler - pushes to queue (not DB!)."""
        output_lines.append(line)
        output_queue.put(line)

    try:
        # Parse YAML
        workflow_data = yaml.safe_load(yaml_content)
        workflow = DevflowWorkflow.from_dict(workflow_data)

        # Execute workflow
        run_workflow(workflow, output_callback=output_handler)

        # Update status to completed
        execution.status = "completed"
        execution.output = "\n".join(output_lines)

    except WorkflowCycleError as e:
        execution.status = "failed"
        execution.output = f"Cycle detected: {e}"
    except ExecutionError as e:
        execution.status = "failed"
        execution.output = f"Execution failed: {e}"
    except Exception as e:
        execution.status = "failed"
        execution.output = f"Error: {e}"
    finally:
        execution.finished_at = datetime.utcnow()
        db.commit()
        db.close()  # Close the thread's session

        # Cleanup queue when done
        if execution_id in execution_queues:
            del execution_queues[execution_id]


def execute_workflow(
    db: Session,
    execution_data: ExecutionCreate,
) -> Execution:
    """Execute a workflow.

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

    # Create queue BEFORE starting thread (avoids race condition)
    output_queue: Queue = Queue()
    execution_queues[execution.id] = output_queue

    # Run in background thread (creates its own DB session)
    thread = threading.Thread(
        target=run_workflow_in_background,
        args=(execution.id, yaml_content, output_queue),
    )
    thread.start()

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
