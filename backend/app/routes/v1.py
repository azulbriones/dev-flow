"""API v1 routes - Versioned API endpoints."""

from .execute import router as execute_router
from .workflows import router as workflows_router


def get_v1_router():
    """Create and configure the v1 API router.

    Returns:
        APIRouter configured with all v1 endpoints.
    """
    from fastapi import APIRouter

    v1_router = APIRouter(prefix="/v1", tags=["v1"])

    v1_router.include_router(workflows_router)
    v1_router.include_router(execute_router)

    return v1_router


__all__ = ["get_v1_router"]