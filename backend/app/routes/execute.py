"""Execution routes - Execute and WebSocket endpoints."""

from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.execution import ExecutionCreate, ExecutionResponse
from ..services.execution_service import (
    get_execution,
    list_executions,
)
from ..services.execution_service import execute_workflow
from ..services.workflow_service import get_workflow
from ..core.redis import subscribe_output

router = APIRouter(prefix="", tags=["execute"])


# ============================================================================
# REST Endpoints
# ============================================================================


@router.post(
    "/execute", response_model=ExecutionResponse, status_code=status.HTTP_202_ACCEPTED
)
def post_execute(
    execution_data: ExecutionCreate,
    db: Session = Depends(get_db),
) -> ExecutionResponse:
    """Execute a workflow.

    Args:
        execution_data: Execution data (YAML or workflow_id).
        db: Database session.

    Returns:
        Created execution.

    Raises:
        HTTPException: If no content provided.
    """
    # Validate workflow_id if provided
    if execution_data.workflow_id:
        workflow = get_workflow(db, execution_data.workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {execution_data.workflow_id} not found",
            )

    try:
        return execute_workflow(db, execution_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/executions", response_model=List[ExecutionResponse])
def get_executions(db: Session = Depends(get_db)) -> List[ExecutionResponse]:
    """List all executions.

    Args:
        db: Database session.

    Returns:
        List of executions.
    """
    return list_executions(db)


@router.get("/executions/{execution_id}", response_model=ExecutionResponse)
def get_execution_by_id(
    execution_id: int,
    db: Session = Depends(get_db),
) -> ExecutionResponse:
    """Get an execution by ID.

    Args:
        execution_id: Execution ID.
        db: Database session.

    Returns:
        Execution.

    Raises:
        HTTPException: If execution not found.
    """
    execution = get_execution(db, execution_id)
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution {execution_id} not found",
        )
    return execution


# ============================================================================
# WebSocket - Redis Pub/Sub Pattern
# ============================================================================


@router.websocket("/execute/{execution_id}/stream")
async def websocket_execute(
    websocket: WebSocket, execution_id: int, db: Session = Depends(get_db)
) -> None:
    """WebSocket endpoint for streaming execution output via Redis Pub/Sub.

    Uses Redis Pub/Sub pattern:
    - Celery worker publishes output to Redis channel
    - WebSocket subscribes to Redis channel
    - Real-time streaming without polling

    Args:
        websocket: WebSocket connection.
        execution_id: Execution ID.
        db: Database session (initial check only).
    """
    await websocket.accept()

    # Verify execution exists
    execution = get_execution(db, execution_id)
    if not execution:
        await websocket.send_text("ERROR: Execution not found")
        await websocket.close()
        return

    # If execution already completed, send stored output
    if execution.status in ("completed", "failed") and execution.output:
        await websocket.send_text(execution.output)
        await websocket.close()
        return

    try:
        # Subscribe to Redis channel for this execution
        async for line in subscribe_output(execution_id):
            await websocket.send_text(line)

            # Check if execution completed (by parsing the final message)
            if line.startswith("=== Execution"):
                break

    except WebSocketDisconnect:
        pass  # Client disconnected
    finally:
        await websocket.close()
