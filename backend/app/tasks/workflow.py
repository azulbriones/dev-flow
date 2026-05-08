"""Celery tasks for workflow execution."""

from datetime import datetime
from celery import Task
from sqlalchemy import exc as sqlalchemy_exc

from app.core.redis import publish_output_sync
from app.database import SessionLocal
from app.models.execution import Execution
from app.tasks import celery_app


@celery_app.task(bind=True, name="execute_workflow")
def execute_workflow(self: Task, execution_id: int, yaml_content: str) -> dict:
    """Execute workflow as Celery task.

    Args:
        execution_id: Execution ID in database.
        yaml_content: YAML workflow content.

    Returns:
        Execution result dict.
    """
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
            publish_output_sync(execution_id, f"{line}\n")
            output_lines.append(line)

        # Publish initial status
        output_handler(f"Starting workflow execution {execution_id}")

        # Parse and validate workflow from YAML
        from app.services.execution_service import validate_workflow_yaml
        from app.services.workflow_service import WorkflowValidationError

        try:
            data = validate_workflow_yaml(yaml_content)
        except WorkflowValidationError as e:
            output_handler(f"Error: {e}")
            execution.status = "failed"
            execution.error_message = str(e)
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()
            return {"status": "failed", "error": str(e)}

        workflow = Workflow(
            name=data.get("name", "Unnamed"),
            description=data.get("description", ""),
            version=data.get("version", "1.0.0"),
            steps=[
                Step(
                    name=s["name"],
                    run=s["run"],
                    depends_on=s.get("depends_on", s.get("requires", [])),
                )
                for s in data.get("steps", [])
            ],
        )

        output_handler(f"Workflow: {workflow.name}")
        output_handler(f"Steps: {len(workflow.steps)}")

        try:
            result = run_workflow(workflow, output_callback=output_handler)

            output_handler("Workflow completed successfully!")

            # Success
            execution.status = "completed"
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()
            return {"status": "completed", "result": result}

        except WorkflowCycleError as e:
            output_handler("Error: Cycle detected in workflow")
            execution.status = "failed"
            execution.error_message = f"Cycle detected: {e}"
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()
            return {"status": "failed", "error": str(e)}

        except ExecutionError as e:
            output_handler(f"Error: {e}")
            execution.status = "failed"
            execution.error_message = str(e)
            execution.output = "\n".join(output_lines)
            execution.finished_at = datetime.utcnow()
            db.commit()
            return {"status": "failed", "error": str(e)}

    except (sqlalchemy_exc.SQLAlchemyError, RuntimeError, OSError) as e:
        # Specific database/system errors
        try:
            execution = db.query(Execution).filter(Execution.id == execution_id).first()
            if execution:
                publish_output_sync(execution_id, f"\nUnexpected error: {e}\n")
                execution.status = "failed"
                execution.error_message = str(e)
                execution.output = "\n".join(output_lines)
                execution.finished_at = datetime.utcnow()
                db.commit()
        except sqlalchemy_exc.SQLAlchemyError:
            pass  # Can't recover if DB is broken

        raise

    finally:
        db.close()


@celery_app.task(name="health_check")
def health_check() -> str:
    """Health check task for Celery."""
    return "OK"
