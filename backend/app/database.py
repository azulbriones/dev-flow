"""Database configuration and session management."""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# SQLite database URL
DATABASE_URL = "sqlite:///./devflow.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session.

    Yields:
        Session: Database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()