import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Add apps/api to path so src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.core.config import settings
from src.core.database import Base
from src.identity.models import Organization, User, OrganizationMembership
from src.initiatives.models import Initiative, InitiativeVersion, Investment, InvestmentCostItem
from src.measurements.models import (
    MetricDefinition, MetricVersion, InitiativeMetric, Baseline,
    DataSource, SourceFile, IngestionRun, Observation, DataQualityAssessment
)
import src.personal.models

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Dynamically set the sqlalchemy connection string from configuration if not overridden by test runner
current_url = config.get_main_option("sqlalchemy.url")
if not current_url or "driver://user:pass" in current_url:
    active_url = settings.get_active_database_url()
    config.set_main_option("sqlalchemy.url", active_url)
else:
    active_url = current_url

# Safety check to prevent accidental migrations against remote/Supabase databases
is_remote = False
if active_url and "@" in active_url:
    host_part = active_url.split("@")[1]
    host = host_part.split("/")[0].split(":")[0]
    if host not in ("localhost", "127.0.0.1"):
        is_remote = True

if is_remote and not settings.SUPABASE_MIGRATION_AUTHORIZED:
    import sys
    sys.stderr.write("\nRemote database migration blocked.\nExplicit Supabase migration authorization is required.\n\n")
    sys.exit(1)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
