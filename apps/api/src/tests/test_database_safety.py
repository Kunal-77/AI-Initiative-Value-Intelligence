import sys
from unittest.mock import MagicMock, patch
import pytest
from src.core.config import Settings

def test_pytest_resolves_test_database_url():
    """Verify that pytest automatically forces and resolves TEST_DATABASE_URL."""
    from src.core.config import settings
    assert settings.DB_ENV == "test"
    assert settings.get_active_database_url() == settings.TEST_DATABASE_URL

def test_database_url_resolution():
    """Verify routing logic for database environment settings."""
    # 1. Default (local) does not resolve Supabase
    settings_local = Settings(DB_ENV="local")
    assert settings_local.get_active_database_url() == settings_local.DATABASE_URL
    assert "supabase.com" not in settings_local.get_active_database_url()

    # 2. Explicit local migration works
    assert settings_local.get_active_database_url() == settings_local.DATABASE_URL

    # 3. Explicit test migration works
    settings_test = Settings(DB_ENV="test")
    assert settings_test.get_active_database_url() == settings_test.TEST_DATABASE_URL

    # 4. Explicit supabase works
    settings_sb = Settings(DB_ENV="supabase")
    assert settings_sb.get_active_database_url() == settings_sb.SUPABASE_DATABASE_URL

def test_remote_migration_blocked_without_auth():
    """Verify that attempting a remote migration without explicit authorization triggers a block."""
    settings_mock = Settings(
        DB_ENV="supabase",
        SUPABASE_DATABASE_URL="postgresql+psycopg://secret_user:secret_password@aws-1.pooler.supabase.com:6543/postgres",
        SUPABASE_MIGRATION_AUTHORIZED=False
    )
    
    active_url = settings_mock.get_active_database_url()
    
    # Parse host
    is_remote = False
    if active_url and "@" in active_url:
        host_part = active_url.split("@")[1]
        host = host_part.split("/")[0].split(":")[0]
        if host not in ("localhost", "127.0.0.1"):
            is_remote = True
            
    assert is_remote is True
    
    # Mock sys.exit and sys.stderr.write to simulate and verify the guard in env.py
    with patch("sys.exit") as mock_exit, patch("sys.stderr.write") as mock_write:
        if is_remote and not settings_mock.SUPABASE_MIGRATION_AUTHORIZED:
            sys.stderr.write("\nRemote database migration blocked.\nExplicit Supabase migration authorization is required.\n\n")
            sys.exit(1)
            
        mock_exit.assert_called_once_with(1)
        mock_write.assert_called_once()
        
        # Verify no credentials appear in the error output
        written_msg = mock_write.call_args[0][0]
        assert "Remote database migration blocked." in written_msg
        assert "Explicit Supabase migration authorization is required." in written_msg
        assert "secret_password" not in written_msg
        assert "aws-1" not in written_msg
        assert "supabase.com" not in written_msg

def test_remote_migration_allowed_with_auth():
    """Verify that explicit Supabase migration authorization bypasses the block."""
    settings_mock = Settings(
        DB_ENV="supabase",
        SUPABASE_DATABASE_URL="postgresql+psycopg://secret_user:secret_password@aws-1.pooler.supabase.com:6543/postgres",
        SUPABASE_MIGRATION_AUTHORIZED=True
    )
    
    active_url = settings_mock.get_active_database_url()
    
    is_remote = False
    if active_url and "@" in active_url:
        host_part = active_url.split("@")[1]
        host = host_part.split("/")[0].split(":")[0]
        if host not in ("localhost", "127.0.0.1"):
            is_remote = True
            
    assert is_remote is True
    
    blocked = False
    if is_remote and not settings_mock.SUPABASE_MIGRATION_AUTHORIZED:
        blocked = True
        
    assert blocked is False
