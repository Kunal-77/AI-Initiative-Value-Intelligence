from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from datetime import datetime, timezone
from src.core.config import settings

class Base(DeclarativeBase):
    pass

@event.listens_for(Base, "before_update", propagate=True)
def update_timestamp_listener(mapper, connection, target):
    """
    ORM-managed updated_at automatic timestamp updates.
    """
    if hasattr(target, "updated_at"):
        target.updated_at = datetime.now(timezone.utc)

# Create SQLAlchemy connection engine
# Using psycopg3 (driver is "postgresql" which maps to psycopg v3 in python)
engine = create_engine(
    settings.get_active_database_url(),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Database Session Local Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
