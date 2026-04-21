"""Main FastAPI application for DevFlow."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.wsgi import WSGIMiddleware

from .database import Base, engine
from .routes.v1 import get_v1_router
from .core.redis import RedisClient


# Default CORS origins for local development
DEFAULT_ORIGINS = "*"  # noqa: E501


def get_cors_origins() -> list[str]:
    """Get CORS origins from environment."""
    origins = os.getenv("CORS_ORIGINS", DEFAULT_ORIGINS)
    if origins == "*":
        return ["*"]
    return [o.strip() for o in origins.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Startup: create tables and Redis client
    Base.metadata.create_all(bind=engine)
    await RedisClient.get_client()
    yield
    # Shutdown: close Redis client
    await RedisClient.close()


app = FastAPI(
    title="DevFlow API v1",
    description="API for DevFlow workflow automation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Development mode allows all origins for WebSocket
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=False,  # Cannot use credentials with wildcard origin
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include v1 router
v1_router = get_v1_router()
app.include_router(v1_router, prefix="/api/v1")


@app.middleware("http")
async def add_version_header(request: Request, call_next):
    """Add API version header to all v1 responses."""
    response = await call_next(request)
    if request.url.path.startswith("/api/v1"):
        response.headers["API-Version"] = "v1"
    return response


@app.get("/")
def root() -> dict:
    """Health check endpoint."""
    return {"message": "DevFlow API is running!"}


@app.get("/health")
def health() -> dict:
    """Service health check endpoint."""
    return {"status": "healthy"}


# Backward compatibility - deprecated /api routes
@app.get("/api/{path:path}")
async def deprecated_api(path: str) -> dict:
    """Deprecated API endpoint - redirect to v1."""
    return {
        "error": f"Use /api/v1/{path} instead",
        "deprecated": True,
    }