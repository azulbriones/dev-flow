"""DevFlow API client for CLI."""

import os
from typing import Any, Callable

import httpx
import yaml
import websockets


def get_api_url() -> str:
    """Get API URL from environment or default."""
    return os.getenv("DEVFLOW_API_URL", "http://localhost:8000")


def get_ws_url() -> str:
    """Get WebSocket URL from environment."""
    return get_api_url().replace("http", "ws")


def create_execution(yaml_path: str) -> dict[str, Any]:
    """Send workflow YAML to backend for execution.

    Args:
        yaml_path: Path to workflow YAML file.

    Returns:
        Execution response with ID and status.

    Raises:
        ValueError: If YAML file is invalid.
    """
    api_url = get_api_url()

    try:
        with open(yaml_path) as f:
            yaml_content = f.read()
    except FileNotFoundError:
        raise ValueError(f"Archivo no encontrado: {yaml_path}")
    except OSError as e:
        raise ValueError(f"Error leyendo archivo: {e}")

    try:
        yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        raise ValueError(f"YAML inválido: {e}")

    response = httpx.post(
        f"{api_url}/api/v1/execute",
        json={"yaml": yaml_content},
        timeout=30.0,
    )

    if response.status_code == 200:
        return response.json()
    elif response.status_code == 422:
        raise ValueError(f"YAML inválido: {response.json()}")
    else:
        raise ValueError(f"Error API: {response.status_code}")


def get_execution(execution_id: int) -> dict[str, Any]:
    """Get execution status."""
    api_url = get_api_url()
    response = httpx.get(f"{api_url}/api/v1/executions/{execution_id}", timeout=10.0)
    return response.json()


async def stream_execution(
    execution_id: int,
    on_message: Callable[[str], None],
) -> None:
    """Connect to WebSocket and stream execution output."""
    ws_url = f"{get_ws_url()}/api/v1/execute/{execution_id}/stream"
    async with websockets.connect(ws_url) as ws:
        async for message in ws:
            on_message(message)
