"""Workflow routes - CRUD endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.workflow import WorkflowCreate, WorkflowResponse
from ..services.workflow_service import (
    create_workflow,
    delete_workflow,
    get_workflow,
    list_workflows,
)

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.get("", response_model=List[WorkflowResponse])
def get_workflows(db: Session = Depends(get_db)) -> List[WorkflowResponse]:
    """List all workflows.

    Args:
        db: Database session.

    Returns:
        List of workflows.
    """
    return list_workflows(db)


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
def post_workflow(
    workflow_data: WorkflowCreate,
    db: Session = Depends(get_db),
) -> WorkflowResponse:
    """Create a new workflow.

    Args:
        workflow_data: Workflow creation data.
        db: Database session.

    Returns:
        Created workflow.
    """
    return create_workflow(db, workflow_data)


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow_by_id(
    workflow_id: int,
    db: Session = Depends(get_db),
) -> WorkflowResponse:
    """Get a workflow by ID.

    Args:
        workflow_id: Workflow ID.
        db: Database session.

    Returns:
        Workflow.

    Raises:
        HTTPException: If workflow not found.
    """
    workflow = get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow {workflow_id} not found",
        )
    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow_by_id(
    workflow_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a workflow by ID.

    Args:
        workflow_id: Workflow ID.
        db: Database session.

    Raises:
        HTTPException: If workflow not found.
    """
    deleted = delete_workflow(db, workflow_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow {workflow_id} not found",
        )
