import os
import sys

# Force the database environment to "test" before any database or settings imports
os.environ["DB_ENV"] = "test"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from unittest.mock import patch, AsyncMock

# Add project root to sys.path so src is importable in pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.core.config import settings
from src.core.database import Base, get_db
from src.core.security import ClerkTokenVerifier
from src.main import app

# Create dedicated test engine (testing must be against PostgreSQL)
test_engine = create_engine(settings.TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Runs Alembic migrations on the test database at the beginning of the test session.
    """
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.TEST_DATABASE_URL)
    
    # Run migrations to head
    command.upgrade(alembic_cfg, "head")
    
    yield
    
    # Clean up test database schemas after session completes
    # Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db(setup_test_db):
    """
    Provides a database session wrapped in a transaction that is rolled back
    after each test. This guarantees strict data isolation between runs.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    """
    Overrides the get_db dependency in the FastAPI application to use the
    isolated test database session transaction.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    from fastapi.testclient import TestClient
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def mock_clerk_verifier():
    """
    Mocks the ClerkTokenVerifier token parsing method to return customizable claims.
    """
    with patch.object(ClerkTokenVerifier, "verify_token", new_callable=AsyncMock) as mock:
        yield mock
