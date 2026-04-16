"""Main FastAPI application for DevFlow."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="DevFlow API",
    description="API for DevFlow workflow automation",
    version="0.1.0",
)

# CORS: permitir acceso desde frontend local (en producción, usar dominio específico)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    """Health check endpoint.

    Returns:
        dict: Welcome message.
    """
    return {"message": "DevFlow API is running!"}


@app.get("/health")
def health() -> dict:
    """Service health check endpoint.

    Returns:
        dict: Service status.
    """
    return {"status": "healthy"}