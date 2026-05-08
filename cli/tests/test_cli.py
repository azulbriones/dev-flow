"""Definir las pruebas del CLI."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from click.testing import CliRunner

from devflow.__main__ import cli


@pytest.fixture
def runner() -> CliRunner:
    """Proveer un runner del CLI."""
    return CliRunner()


@pytest.fixture
def sample_yaml(tmp_path: Path) -> str:
    """Crear un YAML de workflow de ejemplo."""
    yaml_content = """name: Test Workflow
version: "1.0"
description: Test description

steps:
  - name: step-1
    run: echo "hello"

  - name: step-2
    run: echo "world"
    depends_on:
      - step-1
"""
    path = tmp_path / "workflow.yaml"
    path.write_text(yaml_content)
    return str(path)


def test_cli_help(runner: CliRunner) -> None:
    """Verificar que el CLI muestre ayuda."""
    result = runner.invoke(cli, ["--help"])
    assert result.exit_code == 0
    assert "DevFlow" in result.output


def test_init_command(runner: CliRunner, tmp_path: Path) -> None:
    """Verificar que init cree un archivo."""
    with runner.isolated_filesystem(tmp_path):
        result = runner.invoke(cli, ["init", "my-workflow.yaml"])
        assert result.exit_code == 0
        assert "my-workflow.yaml" in result.output


def test_validate_valid_yaml(runner: CliRunner, sample_yaml: str) -> None:
    """Verificar que validate acepte YAML válido."""
    result = runner.invoke(cli, ["validate", sample_yaml])
    assert result.exit_code == 0
    assert "válido" in result.output


def test_validate_invalid_yaml(runner: CliRunner, tmp_path: Path) -> None:
    """Verificar que validate rechace YAML inválido."""
    yaml_content = """name: Test
steps: not-a-list
"""
    path = tmp_path / "invalid.yaml"
    path.write_text(yaml_content)

    result = runner.invoke(cli, ["validate", str(path)])
    assert result.exit_code == 1
    assert "Error" in result.output


@patch("devflow.__main__.create_execution")
def test_run_remote_success(
    mock_create: MagicMock, runner: CliRunner, sample_yaml: str
) -> None:
    """Verificar que run remoto cree una ejecución."""
    mock_create.return_value = {"id": 1, "status": "pending"}

    result = runner.invoke(cli, ["run", sample_yaml, "--remote"])
    assert result.exit_code == 0
    assert "Ejecución creada" in result.output
    mock_create.assert_called_once()


@patch("devflow.api.httpx.post")
def test_create_execution_accepts_202(mock_post: MagicMock, sample_yaml: str) -> None:
    """Verificar que la API acepte 202 Accepted."""
    response = MagicMock()
    response.status_code = 202
    response.json.return_value = {"id": 7, "status": "pending"}
    mock_post.return_value = response

    from devflow.api import create_execution

    result = create_execution(sample_yaml)

    assert result == {"id": 7, "status": "pending"}


def test_validate_rejects_invalid_structure(
    runner: CliRunner, tmp_path: Path
) -> None:
    """Verificar que validate rechace estructura inválida."""
    yaml_content = """name: Test
steps: not-a-list
"""
    path = tmp_path / "invalid-structure.yaml"
    path.write_text(yaml_content)

    result = runner.invoke(cli, ["validate", str(path)])

    assert result.exit_code == 1
    assert "debe ser una lista" in result.output


@patch("devflow.__main__.get_execution")
def test_status_command(mock_get: MagicMock, runner: CliRunner) -> None:
    """Verificar que status muestre la ejecución."""
    mock_get.return_value = {"id": 1, "status": "completed", "output": "ok"}

    result = runner.invoke(cli, ["status", "1"])
    assert result.exit_code == 0
    assert "completed" in result.output
    mock_get.assert_called_once_with(1)
