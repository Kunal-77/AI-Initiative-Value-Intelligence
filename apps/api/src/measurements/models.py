import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, DateTime, ForeignKey, ForeignKeyConstraint, UniqueConstraint, CheckConstraint, Integer, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base

class MetricDefinition(Base):
    __tablename__ = "metric_definitions"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_metric_defs_tenant"),
        UniqueConstraint("organization_id", "canonical_key", name="uq_metric_canonical_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    canonical_key: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    versions: Mapped[List["MetricVersion"]] = relationship(back_populates="definition", cascade="all, delete-orphan")

class MetricVersion(Base):
    __tablename__ = "metric_versions"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_metric_versions_tenant"),
        UniqueConstraint("metric_definition_id", "version_number", name="uq_metric_version_number"),
        CheckConstraint("version_number > 0", name="chk_metric_v_num"),
        CheckConstraint("value_type IN ('DECIMAL', 'INTEGER', 'MONEY', 'PERCENT', 'DURATION')", name="chk_metric_value_type"),
        CheckConstraint("improvement_direction IN ('INCREASE', 'DECREASE', 'RANGE', 'NONE')", name="chk_metric_direction"),
        CheckConstraint("aggregation_method IN ('SUM', 'AVG', 'RATIO', 'CUSTOM')", name="chk_metric_agg_method"),
        CheckConstraint("time_grain IN ('DAY', 'WEEK', 'MONTH', 'REVIEW_PERIOD')", name="chk_metric_time_grain"),
        ForeignKeyConstraint(
            ["organization_id", "metric_definition_id"],
            ["metric_definitions.organization_id", "metric_definitions.id"],
            ondelete="CASCADE",
            name="fk_metric_versions_parent"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    metric_definition_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    value_type: Mapped[str] = mapped_column(String(50), nullable=False)
    improvement_direction: Mapped[str] = mapped_column(String(50), nullable=False)
    aggregation_method: Mapped[str] = mapped_column(String(50), nullable=False)
    formula_spec: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    scope_rules: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    time_grain: Mapped[str] = mapped_column(String(50), nullable=False)
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    definition: Mapped["MetricDefinition"] = relationship(back_populates="versions")

class InitiativeMetric(Base):
    __tablename__ = "initiative_metrics"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_initiative_metrics_tenant"),
        UniqueConstraint("organization_id", "id", "initiative_id", name="uq_init_metrics_initiative_composite"),
        UniqueConstraint("organization_id", "id", "metric_version_id", "initiative_id", name="uq_init_metrics_composite_attrs"),
        CheckConstraint("role IN ('PRIMARY_KPI', 'GUARDRAIL', 'SECONDARY', 'CONTEXT')", name="chk_init_metric_role"),
        CheckConstraint("target_type IN ('ABSOLUTE', 'RELATIVE', 'RANGE', 'DIRECTIONAL')", name="chk_init_metric_target"),
        CheckConstraint("threshold_operator IN ('GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'EQUAL', 'BETWEEN')", name="chk_init_metric_operator"),
        CheckConstraint("status IN ('DRAFT', 'APPROVED', 'SUPERSEDED')", name="chk_init_metric_status"),
        CheckConstraint(
            "(target_type = 'ABSOLUTE' AND target_value IS NOT NULL AND target_lower IS NULL AND target_upper IS NULL) OR "
            "(target_type = 'RELATIVE' AND target_value IS NOT NULL AND target_lower IS NULL AND target_upper IS NULL) OR "
            "(target_type = 'RANGE' AND target_lower IS NOT NULL AND target_upper IS NOT NULL AND target_lower <= target_upper AND target_value IS NULL) OR "
            "(target_type = 'DIRECTIONAL' AND target_value IS NULL AND target_lower IS NULL AND target_upper IS NULL)",
            name="chk_target_values_match_type"
        ),
        CheckConstraint(
            "(threshold_operator = 'BETWEEN' AND target_lower IS NOT NULL AND target_upper IS NOT NULL AND target_lower <= target_upper) OR "
            "(threshold_operator != 'BETWEEN' OR threshold_operator IS NULL)",
            name="chk_between_operator_bounds"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="CASCADE",
            name="fk_init_metrics_initiative"
        ),
        ForeignKeyConstraint(
            ["organization_id", "metric_version_id"],
            ["metric_versions.organization_id", "metric_versions.id"],
            ondelete="RESTRICT",
            name="fk_init_metrics_version"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    metric_version_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_value: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    target_lower: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    target_upper: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    threshold_operator: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    review_period: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    validator_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    baselines: Mapped[List["Baseline"]] = relationship(back_populates="initiative_metric", cascade="all, delete-orphan")

class Baseline(Base):
    __tablename__ = "baselines"
    __table_args__ = (
        UniqueConstraint("initiative_metric_id", "version_number", name="uq_baseline_version"),
        CheckConstraint("version_number > 0", name="chk_baselines_version"),
        CheckConstraint("period_end > period_start", name="chk_baselines_dates"),
        CheckConstraint("baseline_type IN ('PRE_DEPLOYMENT', 'RECONSTRUCTED', 'OTHER')", name="chk_baselines_type"),
        CheckConstraint("status IN ('DRAFT', 'APPROVED', 'SUPERSEDED')", name="chk_baselines_status"),
        CheckConstraint(
            "(status = 'DRAFT' AND approved_by_user_id IS NULL AND approved_at IS NULL) OR "
            "(status = 'APPROVED' AND approved_by_user_id IS NOT NULL AND approved_at IS NOT NULL) OR "
            "(status = 'SUPERSEDED')",
            name="chk_baseline_approval_consistency"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_metric_id"],
            ["initiative_metrics.organization_id", "initiative_metrics.id"],
            ondelete="CASCADE",
            name="fk_baselines_parent"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_metric_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    value: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    scope: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    baseline_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_method: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    approved_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    change_reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative_metric: Mapped["InitiativeMetric"] = relationship(back_populates="baselines")


class DataSource(Base):
    __tablename__ = "data_sources"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_data_sources_tenant"),
        CheckConstraint("health_state IN ('HEALTHY', 'PARTIAL', 'STALE', 'BLOCKED', 'UNKNOWN')", name="chk_source_health"),
        CheckConstraint("source_type IN ('CSV', 'PARQUET', 'MANUAL', 'CONNECTOR')", name="chk_source_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    provider: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    health_state: Mapped[str] = mapped_column(String(50), default="UNKNOWN", nullable=False)
    last_success_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    configuration: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class SourceFile(Base):
    __tablename__ = "source_files"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_source_files_tenant"),
        UniqueConstraint("organization_id", "data_source_id", "checksum", name="uq_source_files_checksum"),
        CheckConstraint("size_bytes > 0", name="chk_file_size"),
        ForeignKeyConstraint(
            ["organization_id", "data_source_id"],
            ["data_sources.organization_id", "data_sources.id"],
            ondelete="RESTRICT",
            name="fk_source_files_data_source"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    data_source_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    object_key: Mapped[str] = mapped_column(nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    classification: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    uploaded_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_ingestion_runs_tenant"),
        UniqueConstraint("organization_id", "data_source_id", "idempotency_key", name="uq_ingestion_runs_idempotency"),
        CheckConstraint("status IN ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED')", name="chk_ingestion_status"),
        CheckConstraint("rows_received >= 0 AND rows_accepted >= 0 AND rows_rejected >= 0 AND rows_accepted + rows_rejected <= rows_received", name="chk_ingestion_rows_invariants"),
        ForeignKeyConstraint(
            ["organization_id", "data_source_id"],
            ["data_sources.organization_id", "data_sources.id"],
            ondelete="RESTRICT",
            name="fk_ingestion_runs_data_source"
        ),
        ForeignKeyConstraint(
            ["organization_id", "source_file_id"],
            ["source_files.organization_id", "source_files.id"],
            ondelete="RESTRICT",
            name="fk_ingestion_runs_source_file"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    data_source_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    source_file_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="QUEUED", nullable=False)
    mapping_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rows_received: Mapped[int] = mapped_column(default=0, nullable=False)
    rows_accepted: Mapped[int] = mapped_column(default=0, nullable=False)
    rows_rejected: Mapped[int] = mapped_column(default=0, nullable=False)
    error_summary: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class Observation(Base):
    __tablename__ = "observations"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_observations_tenant"),
        UniqueConstraint("organization_id", "id", "initiative_id", name="uq_observations_initiative_composite"),
        UniqueConstraint("ingestion_run_id", "source_row_index", name="uq_observations_source_row"),
        CheckConstraint("period_end >= period_start", name="chk_observations_dates"),
        CheckConstraint("source_row_index >= 0 OR source_row_index IS NULL", name="chk_observation_row_index"),
        CheckConstraint("observation_type IN ('OBSERVED', 'DERIVED', 'RECONSTRUCTED', 'MANUAL')", name="chk_observations_type"),
        CheckConstraint("validation_state IN ('UNVALIDATED', 'VALIDATED', 'REJECTED')", name="chk_observations_validation"),
        CheckConstraint(
            "(observation_type = 'MANUAL' AND ingestion_run_id IS NULL AND source_row_index IS NULL AND data_source_id IS NULL) OR "
            "(observation_type != 'MANUAL')",
            name="chk_manual_lineage_guard"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_metric_id", "metric_version_id", "initiative_id"],
            ["initiative_metrics.organization_id", "initiative_metrics.id", "initiative_metrics.metric_version_id", "initiative_metrics.initiative_id"],
            ondelete="RESTRICT",
            name="fk_observations_init_metric_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "data_source_id"],
            ["data_sources.organization_id", "data_sources.id"],
            ondelete="RESTRICT",
            name="fk_observations_data_source"
        ),
        ForeignKeyConstraint(
            ["organization_id", "ingestion_run_id"],
            ["ingestion_runs.organization_id", "ingestion_runs.id"],
            ondelete="RESTRICT",
            name="fk_observations_ingestion_run"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_metric_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    metric_version_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    data_source_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    ingestion_run_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    source_row_index: Mapped[Optional[int]] = mapped_column(nullable=True)
    value: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    scope: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    observation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    calculation_version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    validation_state: Mapped[str] = mapped_column(String(50), default="UNVALIDATED", nullable=False)
    validated_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class DataQualityAssessment(Base):
    __tablename__ = "data_quality_assessments"
    __table_args__ = (
        CheckConstraint("state IN ('HEALTHY', 'PARTIAL', 'STALE', 'BLOCKED')", name="chk_quality_state"),
        CheckConstraint(
            "(data_source_id IS NOT NULL)::int + (ingestion_run_id IS NOT NULL)::int + (initiative_metric_id IS NOT NULL)::int = 1",
            name="chk_dq_single_target"
        ),
        ForeignKeyConstraint(
            ["organization_id", "data_source_id"],
            ["data_sources.organization_id", "data_sources.id"],
            ondelete="RESTRICT",
            name="fk_dq_data_source"
        ),
        ForeignKeyConstraint(
            ["organization_id", "ingestion_run_id"],
            ["ingestion_runs.organization_id", "ingestion_runs.id"],
            ondelete="RESTRICT",
            name="fk_dq_ingestion_run"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_metric_id"],
            ["initiative_metrics.organization_id", "initiative_metrics.id"],
            ondelete="RESTRICT",
            name="fk_dq_initiative_metric"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    data_source_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    ingestion_run_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    initiative_metric_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    state: Mapped[str] = mapped_column(String(50), default="HEALTHY", nullable=False)
    completeness: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    freshness: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    validity: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    consistency: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    coverage: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    comparability: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    provenance: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    issues: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    method_version: Mapped[str] = mapped_column(String(50), nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
