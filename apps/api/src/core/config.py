import os
from pydantic_settings import BaseSettings, SettingsConfigDict

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
    CLERK_ISSUER_URL: str = "https://useful-bird-65.clerk.accounts.dev"
    CLERK_JWKS_URL: str = "https://useful-bird-65.clerk.accounts.dev/.well-known/jwks.json"

    # CORS configuration (comma-separated list of allowed origins)
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://ai-initiative-value-intelligence-we.vercel.app"

    def get_cors_origins(self) -> list[str]:
        default_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://ai-initiative-value-intelligence-we.vercel.app",
        ]
        if isinstance(self.CORS_ORIGINS, str):
            parsed = [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
            for d in default_origins:
                if d not in parsed:
                    parsed.append(d)
            return parsed
        return default_origins

    def get_active_database_url(self) -> str:
        db_env = self.DB_ENV.lower()
        if db_env == "test":
            url = self.TEST_DATABASE_URL
        elif db_env == "supabase":
            url = self.SUPABASE_DATABASE_URL
        else:
            url = self.DATABASE_URL

        # Automatically normalize postgres:// and postgresql:// to postgresql+psycopg:// for psycopg v3
        if url.startswith("postgres://"):
            url = "postgresql+psycopg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = "postgresql+psycopg://" + url[len("postgresql://"):]

        return url

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
