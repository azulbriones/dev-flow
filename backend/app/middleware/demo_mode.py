"""Demo mode middleware - blocks write operations in production/demo.

Set READ_ONLY_MODE=true environment variable to enable.
"""

import os
from collections.abc import Awaitable, Callable
from functools import wraps
from typing import ParamSpec, TypeVar

from fastapi import HTTPException, status
from starlette.requests import Request
from starlette.responses import Response

P = ParamSpec("P")
R = TypeVar("R")


def is_demo_mode() -> bool:
    """Check if demo mode is enabled via environment variable."""
    return os.getenv("READ_ONLY_MODE", "false").lower() == "true"


def require_write_permission(
    func: Callable[P, Awaitable[R]],
) -> Callable[P, Awaitable[R]]:
    """Bloquear operaciones de escritura en modo demo.

    Usage:
        @router.post("")
        @require_write_permission
        def create_workflow(...):
            ...

    Raises:
        HTTPException: 403 if in demo mode.
    """

    @wraps(func)
    async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        if is_demo_mode():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Write operations are disabled in demo mode. "
                    "Run locally with READ_ONLY_MODE=false for full functionality."
                ),
            )
        return await func(*args, **kwargs)

    return wrapper


async def demo_mode_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    """Bloquear operaciones de escritura en el middleware de demo.

    Applies to: POST, PUT, PATCH, DELETE requests.
    """
    if not is_demo_mode():
        return await call_next(request)

    # Only block write methods (except execution - that's allowed in demo)
    write_methods = {"POST", "PUT", "PATCH", "DELETE"}
    if request.method in write_methods:
        # Allow execution endpoint even in demo mode
        if "/execute" in request.url.path:
            return await call_next(request)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Write operations are disabled in demo mode. "
                "Run locally with READ_ONLY_MODE=false for full functionality."
            ),
        )

    return await call_next(request)
