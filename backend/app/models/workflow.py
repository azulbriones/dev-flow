"""Workflow database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from ..database import Base


class Workflow(Base):
    """Workflow database model."""

    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    yaml_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Workflow(id={self.id}, name='{self.name}')>"
