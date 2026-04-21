"""Celery tasks for workflow execution."""

import sys
from datetime import datetime
from pathlib import Path

import yaml
from celery import Task
from sqlalchemy import exc as sqlalchemy_exc

from app.core.redis import publish_output_sync
from app.database import SessionLocal
from app.models.execution import Execution
from app.tasks import celery_app


def publish(line: str, exec_id: int) -> None:
    """Publish output to Redis (sync)."""
    publish_output_sync(exec_id, line)


def get_cli_path() -> Path:
    """Get CLI path for importing."""
    cli_path = Path(__file__).parent.parent.parent.parent / "cli" / "src"
    return cli_path


def setup_cli_import() -> None:
    """Add CLI to Python path if not already added."""
    cli_path = get_cli_path()
    if str(cli_path) not in sys.path:
        sys.path.insert(0, str(cli_path))


@celery_app.task(bind=True, name="execute_workflow")
def execute_workflow(self: Task, execution_id: int, yaml_content: str) -> dict:
    """Execute workflow as Celery task.

    Args:
        execution_id: Execution ID in database.
        yaml_content: YAML workflow content.

    Returns:
        Execution result dict.
    """
    setup_cli_import()

    # Import CLI modules
    from devflow import run_workflow
    from devflow.models import ExecutionError, WorkflowCycleError, Workflow, Step

    # Create new session for this worker
    db = SessionLocal()

    try:
        # Get execution
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            return {"error": "Execution not found"}

        # Update status to running
        execution.status = "running"
        db.commit()

        # Accumulate output
        output_lines: list[str] = []

        def output_handler(line: str) -> None:
            """Stream output to Redis and accumulate."""
            publish(f"{line}\n", execution_id)
            output_lines.append(line)

        # Publish initial status
        output_handler(f"Starting workflow execution {execution_id}")

        # Parse and validate workflow from YAML
        data = yaml.safe_load(yaml_content)
        workflow = Workflow(
            name=data.get("name", "Unnamed"),
            description=data.get("description", ""),
            version=data.get("version", "1.0.0"),
            steps=[
                Step(
                    name=s["name"],
                    run=s["run"],
                    depends_on=s.get("depends_on", []),
                )
                for s in data.get("steps", [])
            ]
        )

        output_handler(f"Workflow: {workflow.name}")
        output_handler(f"Steps: {len(workflow.steps)}")

        try:
            result = run_workflow(workflow, output_callback=output_handler)

            # Success
            execution.status = "completed"
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()

            output_handler("Workflow completed successfully!")
            return {"status": "completed", "result": result}

        except WorkflowCycleError as e:
            execution.status = "failed"
            execution.error_message = f"Cycle detected: {e}"
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()
            output_handler(f"Error: Cycle detected in workflow")
            return {"status": "failed", "error": str(e)}

        except ExecutionError as e:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()
            output_handler(f"Error: {e}")
            return {"status": "failed", "error": str(e)}

    except (sqlalchemy_exc.SQLAlchemyError, RuntimeError, OSError) as e:
        # Specific database/system errors
        try:
            execution = db.query(Execution).filter(Execution.id == execution_id).first()
            if execution:
                execution.status = "failed"
                execution.error_message = str(e)
                execution.output = "\n".join(output_lines)
                execution.finished_at = datetime.utcnow()
                db.commit()
            publish(f"\nUnexpected error: {e}\n", execution_id)
        except sqlalchemy_exc.SQLAlchemyError:
            pass  # Can't recover if DB is broken

        raise

    finally:
        db.close()


@celery_app.task(name="health_check")
def health_check() -> str:
    """Health check task for Celery."""
    return "OK"