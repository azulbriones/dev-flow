"""Execution database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Execution(Base):
    """Execution database model."""

    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    status = Column(
        String(50), default="pending"
    )  # pending, running, completed, failed
    output = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    # Relationship
    workflow = relationship("Workflow", backref="executions")

    def __repr__(self) -> str:
        return f"<Execution(id={self.id}, workflow_id={self.workflow_id}, status='{self.status}')>"
