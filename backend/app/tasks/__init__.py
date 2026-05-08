"""Celery application configuration."""

from celery import Celery

from app.core.redis import get_redis_url

# Create Celery app (separate from tasks to avoid circular imports)
celery_app = Celery(
    "devflow",
    broker=get_redis_url(),
    backend=get_redis_url(),
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3000,  # 50 minutes soft limit
)

# Register tasks
from app.tasks.workflow import execute_workflow, health_check  # noqa: F401, E402

celery_app.autodiscover_tasks(["app.tasks"])
