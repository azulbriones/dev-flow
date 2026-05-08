"""Backend smoke tests."""

from fastapi.testclient import TestClient

from app.main import app
from devflow import run_workflow


def test_root_health_endpoints() -> None:
    """Verify basic app endpoints respond."""
    client = TestClient(app)

    root_response = client.get("/")
    health_response = client.get("/health")

    assert root_response.status_code == 200
    assert root_response.json() == {"message": "DevFlow API is running!"}
    assert health_response.status_code == 200
    assert health_response.json() == {"status": "healthy"}


def test_cli_package_is_importable() -> None:
    """Verify backend runtime can import the CLI package directly."""
    assert callable(run_workflow)
