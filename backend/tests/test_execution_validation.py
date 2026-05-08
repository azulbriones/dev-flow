"""Tests for execution validation and cleanup."""

import asyncio
from collections.abc import Generator
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from starlette.websockets import WebSocketState

from app.core.redis import RedisClient
from app.database import Base
from app.models.execution import Execution
from app.models.workflow import Workflow
from app.routes.execute import _close_websocket_safely
from app.schemas.execution import ExecutionCreate
from app.services import execution_service
from app.services.workflow_service import WorkflowValidationError
from app.tasks.workflow import execute_workflow as execute_workflow_task


@pytest.fixture()
def db_session(tmp_path: Path) -> Generator[Session, None, None]:
    """Create an isolated database session."""
    engine = create_engine(f"sqlite:///{tmp_path / 'devflow.db'}")
    Base.metadata.create_all(bind=engine)
    session_local = sessionmaker(bind=engine)
    db = session_local()
    try:
        yield db
    finally:
        db.close()


def test_execute_workflow_rejects_invalid_structure(
    db_session: Session,
) -> None:
    """Execution service should fail fast on invalid workflow shape."""
    workflow = Workflow(
        name="demo",
        description="",
        yaml_content="name: demo\nsteps: not-a-list",
    )
    db_session.add(workflow)
    db_session.commit()
    db_session.refresh(workflow)

    with pytest.raises(WorkflowValidationError, match="debe ser una lista"):
        execution_service.execute_workflow(
            db_session,
            ExecutionCreate(workflow_id=workflow.id),
        )

    assert db_session.query(Execution).count() == 0


def test_close_websocket_is_idempotent() -> None:
    """Websocket close helper should ignore repeated closes."""

    class FakeWebSocket:
        def __init__(self) -> None:
            self.application_state = WebSocketState.CONNECTED
            self.close_calls = 0

        async def close(self) -> None:
            self.close_calls += 1
            self.application_state = WebSocketState.DISCONNECTED

    websocket = FakeWebSocket()

    asyncio.run(_close_websocket_safely(websocket))
    asyncio.run(_close_websocket_safely(websocket))

    assert websocket.close_calls == 1


def test_redis_pubsub_cleanup_is_idempotent() -> None:
    """Redis pubsub cleanup should not fail when called repeatedly."""

    class FakePubSub:
        def __init__(self) -> None:
            self.unsubscribed = 0
            self.closed = 0

        async def unsubscribe(self) -> None:
            self.unsubscribed += 1
            if self.unsubscribed > 1:
                raise RuntimeError("already unsubscribed")

        async def close(self) -> None:
            self.closed += 1
            if self.closed > 1:
                raise RuntimeError("already closed")

    pubsub = FakePubSub()

    asyncio.run(RedisClient.unsubscribe(pubsub))
    asyncio.run(RedisClient.unsubscribe(pubsub))

    assert pubsub.unsubscribed == 2
    assert pubsub.closed == 2


def test_worker_rejects_invalid_yaml(
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Worker task should fail gracefully on malformed workflow YAML."""
    execution = Execution(status="pending")
    db_session.add(execution)
    db_session.commit()
    db_session.refresh(execution)

    monkeypatch.setattr(
        "app.tasks.workflow.publish_output_sync",
        lambda *args, **kwargs: 0,
    )
    monkeypatch.setattr(
        "app.tasks.workflow.SessionLocal",
        sessionmaker(bind=db_session.get_bind()),
    )

    result = execute_workflow_task.run(
        execution.id,
        "name: demo\nsteps: not-a-list",
    )

    db_session.refresh(execution)

    assert result["status"] == "failed"
    assert execution.status == "failed"
    assert "debe ser una lista" in (execution.error_message or "")
