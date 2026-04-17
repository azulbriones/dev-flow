"""Execution routes - Execute and WebSocket endpoints."""

import asyncio
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
    execution_queues,
    get_execution,
    list_executions,
)
from ..services.execution_service import execute_workflow
from ..services.workflow_service import get_workflow

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
# WebSocket - Direct Push Pattern (Queue-based)
# ============================================================================


@router.websocket("/execute/{execution_id}/stream")
async def websocket_execute(
    websocket: WebSocket, execution_id: int, db: Session = Depends(get_db)
):
    """WebSocket endpoint for streaming execution output.

    Uses Queue-based direct push pattern:
    - Service pushes output lines to a thread-safe Queue
    - Route polls from the Queue (not DB!)
    - No DB polling, no async callback issues

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

    # Get queue for this execution
    queue = execution_queues.get(execution_id)
    if not queue:
        # Execution might already be done, send stored output
        if execution.output:
            await websocket.send_text(execution.output)
        await websocket.close()
        return

    try:
        # Poll queue until execution completes
        while execution.status == "running":
            # Poll queue (not DB!) - very fast
            while not queue.empty():
                line = queue.get()
                await websocket.send_text(line)
            await asyncio.sleep(0.1)

        # Send remaining output in queue
        while not queue.empty():
            line = queue.get()
            await websocket.send_text(line)

        # Send final status
        await websocket.send_text(f"\n=== Execution {execution.status} ===")

    except WebSocketDisconnect:
        pass  # Client disconnected
    finally:
        # Clean up queue reference
        if execution_id in execution_queues:
            del execution_queues[execution_id]
        await websocket.close()
