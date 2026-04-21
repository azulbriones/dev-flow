"""Tests for CLI."""

from unittest.mock import MagicMock, patch

import pytest
from click.testing import CliRunner

from devflow.__main__ import cli


@pytest.fixture
def runner() -> CliRunner:
    """Fixture for CLI runner."""
    return CliRunner()


@pytest.fixture
def sample_yaml(tmp_path) -> str:
    """Create a sample workflow YAML."""
    yaml_content = """name: Test Workflow
version: "1.0"
description: Test description

steps:
  - name: step-1
    run: echo "hello"

  - name: step-2
    run: echo "world"
    requires:
      - step-1
"""
    path = tmp_path / "workflow.yaml"
    path.write_text(yaml_content)
    return str(path)


def test_cli_help(runner: CliRunner) -> None:
    """Test CLI shows help."""
    result = runner.invoke(cli, ["--help"])
    assert result.exit_code == 0
    assert "DevFlow" in result.output


def test_init_command(runner: CliRunner, tmp_path: str) -> None:
    """Test init creates a file."""
    with runner.isolated_filesystem(tmp_path):
        result = runner.invoke(cli, ["init", "my-workflow.yaml"])
        assert result.exit_code == 0
        assert "my-workflow.yaml" in result.output


def test_validate_valid_yaml(runner: CliRunner, sample_yaml: str) -> None:
    """Test validate accepts valid YAML."""
    result = runner.invoke(cli, ["validate", sample_yaml])
    assert result.exit_code == 0
    assert "válido" in result.output


def test_validate_invalid_yaml(runner: CliRunner, tmp_path: str) -> None:
    """Test validate rejects invalid YAML."""
    yaml_content = """name: Test
steps: not-a-list
"""
    path = tmp_path / "invalid.yaml"
    path.write_text(yaml_content)

    result = runner.invoke(cli, ["validate", str(path)])
    assert result.exit_code == 1
    assert "Error" in result.output


@patch("devflow.api.create_execution")
def test_run_remote_success(mock_create: MagicMock, runner: CliRunner, sample_yaml: str) -> None:
    """Test run remote creates execution."""
    mock_create.return_value = {"id": 1, "status": "pending"}

    result = runner.invoke(cli, ["run", sample_yaml, "--remote"])
    assert result.exit_code == 0
    assert "Ejecución creada" in result.output
    mock_create.assert_called_once()


@patch("devflow.api.get_execution")
def test_status_command(mock_get: MagicMock, runner: CliRunner) -> None:
    """Test status shows execution info."""
    mock_get.return_value = {"id": 1, "status": "completed", "output": "ok"}

    result = runner.invoke(cli, ["status", "1"])
    assert result.exit_code == 0
    assert "completed" in result.output
    mock_get.assert_called_once_with(1)
