"""Main FastAPI application for DevFlow."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes.v1 import get_v1_router


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevFlow API v1",
    description="API for DevFlow workflow automation",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
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