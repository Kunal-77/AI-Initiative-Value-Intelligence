import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # Database environment selector: "local", "test", or "supabase"
    DB_ENV: str = "local"
    
    # Local development database URL
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/value_intel"
    
    # Local test database URL
    TEST_DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/value_intel_test"
    
    # Remote Supabase development database URL
    SUPABASE_DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/value_intel_supabase"
    
    # Explicit authorization guard for remote database migrations
    SUPABASE_MIGRATION_AUTHORIZED: bool = False
    
    # Clerk Identity settings
    CLERK_ISSUER_URL: str = "https://clerk.example.com"
    CLERK_JWKS_URL: str = "https://clerk.example.com/.well-known/jwks.json"

    def get_active_database_url(self) -> str:
        db_env = self.DB_ENV.lower()
        if db_env == "test":
            return self.TEST_DATABASE_URL
        elif db_env == "supabase":
            return self.SUPABASE_DATABASE_URL
        else:
            return self.DATABASE_URL

    model_config = ConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
