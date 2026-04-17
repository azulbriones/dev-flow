"""Main FastAPI application for DevFlow."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import execute_router, workflows_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevFlow API",
    description="API for DevFlow workflow automation",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workflows_router)
app.include_router(execute_router)


@app.get("/")
def root() -> dict:
    """Health check endpoint."""
    return {"message": "DevFlow API is running!"}


@app.get("/health")
def health() -> dict:
    """Service health check endpoint."""
    return {"status": "healthy"}
