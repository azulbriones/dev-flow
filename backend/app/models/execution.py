"""Execution database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Execution(Base):
    """Execution database model."""

    def __repr__(self) -> str:
        return (
            "<Execution("
            f"id={self.id}, workflow_id={self.workflow_id}, "
            f"status='{self.status}')>"
        )

    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(
        Integer,
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=True,
    )
    status = Column(String(50), default="pending")
    output = Column(Text, nullable=True)
    result = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    # Relationship
    workflow = relationship("Workflow", backref="executions")
