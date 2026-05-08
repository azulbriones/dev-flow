"""Verificar el bootstrap de migraciones Alembic."""

import importlib.util
import sys
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text


BACKEND_ROOT = Path(__file__).resolve().parents[1]
ALEMBIC_INI = BACKEND_ROOT / "alembic.ini"
MIGRATION_PATH = (
    BACKEND_ROOT
    / "alembic"
    / "versions"
    / "0001_execution_workflow_id_nullable.py"
)

_migration_spec = importlib.util.spec_from_file_location(
    "0001_execution_workflow_id_nullable_py",
    MIGRATION_PATH,
)
assert _migration_spec is not None and _migration_spec.loader is not None
_migration_module = importlib.util.module_from_spec(_migration_spec)
sys.modules[_migration_spec.name] = _migration_module
_migration_spec.loader.exec_module(_migration_module)
MigrationSafetyError = _migration_module.MigrationSafetyError


def make_config(db_path: Path) -> Config:
    """Build an Alembic config for a temp SQLite database."""
    config = Config(str(ALEMBIC_INI))
    config.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    config.set_main_option("sqlalchemy.url", f"sqlite:///{db_path}")
    return config


def seed_legacy_schema(db_path: Path) -> None:
    """Create a legacy schema where workflow_id is not nullable."""
    engine = create_engine(f"sqlite:///{db_path}")
    with engine.begin() as conn:
        conn.exec_driver_sql(
            """
            CREATE TABLE workflows (
                id INTEGER NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description VARCHAR(500),
                yaml_content TEXT NOT NULL,
                created_at DATETIME,
                updated_at DATETIME
            )
            """
        )
        conn.exec_driver_sql(
            """
            CREATE TABLE executions (
                id INTEGER NOT NULL PRIMARY KEY,
                workflow_id INTEGER NOT NULL,
                status VARCHAR(50),
                output TEXT,
                result TEXT,
                error_message TEXT,
                started_at DATETIME,
                finished_at DATETIME,
                FOREIGN KEY(workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            text(
                "INSERT INTO workflows (id, name, yaml_content) "
                "VALUES (1, 'sample', 'name: sample')"
            )
        )
        conn.execute(
            text(
                "INSERT INTO executions (id, workflow_id, status) "
                "VALUES (1, 0, 'pending')"
            )
        )


def test_upgrade_normalizes_zero_workflow_ids(tmp_path: Path) -> None:
    """Permitir runs ad hoc y preservar filas legacy."""
    db_path = tmp_path / "devflow.db"
    seed_legacy_schema(db_path)

    command.upgrade(make_config(db_path), "head")

    engine = create_engine(f"sqlite:///{db_path}")
    with engine.connect() as conn:
        notnull = conn.execute(text("PRAGMA table_info(executions)")).fetchall()[1][3]
        workflow_id = conn.execute(
            text("SELECT workflow_id FROM executions WHERE id = 1")
        ).scalar_one()

    assert notnull == 0
    assert workflow_id is None


def test_upgrade_handles_empty_executions_table(tmp_path: Path) -> None:
    """Permitir el upgrade con la tabla executions vacía."""
    db_path = tmp_path / "empty.db"
    engine = create_engine(f"sqlite:///{db_path}")
    with engine.begin() as conn:
        conn.exec_driver_sql(
            """
            CREATE TABLE workflows (
                id INTEGER NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description VARCHAR(500),
                yaml_content TEXT NOT NULL,
                created_at DATETIME,
                updated_at DATETIME
            )
            """
        )
        conn.exec_driver_sql(
            """
            CREATE TABLE executions (
                id INTEGER NOT NULL PRIMARY KEY,
                workflow_id INTEGER NOT NULL,
                status VARCHAR(50),
                output TEXT,
                result TEXT,
                error_message TEXT,
                started_at DATETIME,
                finished_at DATETIME,
                FOREIGN KEY(workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
            )
            """
        )

    command.upgrade(make_config(db_path), "head")

    with engine.connect() as conn:
        rows = conn.execute(text("SELECT COUNT(*) FROM executions")).scalar_one()

    assert rows == 0


def test_downgrade_rejects_null_workflow_ids(tmp_path: Path) -> None:
    """Bloquear el downgrade si existen workflow_id nulos."""
    db_path = tmp_path / "downgrade.db"
    seed_legacy_schema(db_path)

    command.upgrade(make_config(db_path), "head")

    engine = create_engine(f"sqlite:///{db_path}")
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO executions (id, workflow_id, status) "
                "VALUES (2, NULL, 'pending')"
            )
        )

    with pytest.raises(MigrationSafetyError, match="Cannot downgrade"):
        command.downgrade(make_config(db_path), "base")
