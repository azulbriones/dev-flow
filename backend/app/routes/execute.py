"""Execution routes - Execute and WebSocket endpoints."""

import logging
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session
from starlette.websockets import WebSocketState

from ..database import get_db
from ..schemas.execution import ExecutionCreate, ExecutionResponse
from ..services.execution_service import (
    WorkflowNotFoundError,
    WorkflowValidationError,
    execute_workflow,
    get_execution,
    list_executions,
)
from ..core.redis import subscribe_output

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["execute"])


async def _close_websocket_safely(websocket: WebSocket) -> None:
    """Close a websocket only if it is still open."""
    if websocket.application_state == WebSocketState.DISCONNECTED:
        return

    try:
        await websocket.close()
    except RuntimeError as exc:
        if "close message has been sent" not in str(exc):
            raise


# ============================================================================
# REST Endpoints
# ============================================================================


@router.post(
    "/execute",
    response_model=ExecutionResponse,
    status_code=status.HTTP_202_ACCEPTED,
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
    try:
        return execute_workflow(db, execution_data)
    except WorkflowNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except WorkflowValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/executions", response_model=List[ExecutionResponse])
def get_executions(
    workflow_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[ExecutionResponse]:
    """List all executions.

    Args:
        db: Database session.

    Returns:
        List of executions.
    """
    return list_executions(db, workflow_id=workflow_id)


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
    websocket: WebSocket,
    execution_id: int,
    db: Session = Depends(get_db),
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
    logger.info(f"WebSocket connection attempt for execution {execution_id}")

    try:
        await websocket.accept()
        logger.info(f"WebSocket accepted for execution {execution_id}")
    except (RuntimeError, WebSocketDisconnect) as exc:
        logger.error(f"Failed to accept WebSocket: {exc}")
        return

    # Verify execution exists
    execution = get_execution(db, execution_id)
    if not execution:
        await websocket.send_text("ERROR: Execution not found")
        await _close_websocket_safely(websocket)
        return

    logger.info(f"Execution {execution_id} status: {execution.status}")

    # If execution already completed, send stored output
    if execution.status in ("completed", "failed") and execution.output:
        await websocket.send_text(execution.output)
        await _close_websocket_safely(websocket)
        return

    try:
        # Subscribe to Redis channel for this execution
        async for line in subscribe_output(execution_id):
            await websocket.send_text(line)

            # Check if execution completed (by parsing the final message)
            # executor.py sends "==================" (50 equals) and
            # then "Workflow completado exitosamente!"
            if line.startswith("=") or "completado" in line.lower():
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for execution {execution_id}")
    finally:
        await _close_websocket_safely(websocket)
