import uuid
from datetime import datetime, date as datetime_date, timezone
from typing import Optional, List
from sqlalchemy import String, DateTime, Date, ForeignKey, ForeignKeyConstraint, UniqueConstraint, CheckConstraint, Integer, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base

class Initiative(Base):
    __tablename__ = "initiatives"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_initiatives_tenant"),
        CheckConstraint("lifecycle_state IN ('DRAFT', 'SUBMITTED', 'ACTIVE', 'COMPLETED', 'ABANDONED')", name="chk_initiatives_lifecycle"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_area: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    owner_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    lifecycle_state: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    problem_statement: Mapped[Optional[str]] = mapped_column(nullable=True)
    proposed_intervention: Mapped[Optional[str]] = mapped_column(nullable=True)
    expected_business_outcome: Mapped[Optional[str]] = mapped_column(nullable=True)
    planned_start_date: Mapped[Optional[datetime_date]] = mapped_column(Date, nullable=True)
    actual_start_date: Mapped[Optional[datetime_date]] = mapped_column(Date, nullable=True)
    next_review_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    executive_sponsor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    project_lead: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_metric_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_metric_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    versions: Mapped[List["InitiativeVersion"]] = relationship(back_populates="initiative", cascade="all, delete-orphan")
    investments: Mapped[List["Investment"]] = relationship(back_populates="initiative", cascade="all, delete-orphan")

class InitiativeVersion(Base):
    __tablename__ = "initiative_versions"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_initiative_versions_tenant"),
        UniqueConstraint("initiative_id", "version_number", name="uq_initiative_version"),
        CheckConstraint("version_number > 0", name="chk_init_versions_num"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="CASCADE",
            name="fk_init_versions_tenant"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    business_case_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    change_reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative: Mapped["Initiative"] = relationship(back_populates="versions")

class Investment(Base):
    __tablename__ = "investments"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_investments_tenant"),
        UniqueConstraint("organization_id", "id", "currency", name="uq_investments_tenant_currency"),
        UniqueConstraint("initiative_id", "version_number", name="uq_investment_version"),
        CheckConstraint("version_number > 0", name="chk_investments_version"),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="chk_investments_currency"),
        CheckConstraint("status IN ('DRAFT', 'APPROVED', 'SUPERSEDED')", name="chk_investments_status"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="CASCADE",
            name="fk_investments_tenant"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    period_start: Mapped[Optional[datetime_date]] = mapped_column(Date, nullable=True)
    period_end: Mapped[Optional[datetime_date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    assumptions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative: Mapped["Initiative"] = relationship(back_populates="investments")
    cost_items: Mapped[List["InvestmentCostItem"]] = relationship(back_populates="investment", cascade="all, delete-orphan")

class InvestmentCostItem(Base):
    __tablename__ = "investment_cost_items"
    __table_args__ = (
        CheckConstraint("amount >= 0.00", name="chk_cost_items_amount"),
        CheckConstraint("category IN ('SOFTWARE', 'INFRASTRUCTURE', 'LABOR', 'OTHER')", name="chk_cost_category"),
        CheckConstraint("value_type IN ('PLANNED', 'ACTUAL', 'MODELED')", name="chk_cost_value_type"),
        CheckConstraint("recurrence IN ('ONE_TIME', 'MONTHLY', 'ANNUAL')", name="chk_cost_recurrence"),
        ForeignKeyConstraint(
            ["organization_id", "investment_id", "currency"],
            ["investments.organization_id", "investments.id", "investments.currency"],
            ondelete="CASCADE",
            name="fk_cost_items_parent"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    investment_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    value_type: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    recurrence: Mapped[str] = mapped_column(String(50), default="ONE_TIME", nullable=False)
    source_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    assumption_note: Mapped[Optional[str]] = mapped_column(nullable=True)

    # New Cost Ledger columns
    expense_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    vendor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    date: Mapped[Optional[datetime_date]] = mapped_column(Date, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    approval_owner: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    investment: Mapped["Investment"] = relationship(back_populates="cost_items")


class Claim(Base):
    __tablename__ = "claims"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_claims_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="RESTRICT",
            name="fk_claims_initiative_composite"
        ),
        CheckConstraint("claim_type IN ('DESCRIPTIVE', 'CHANGE', 'ASSOCIATION', 'ATTRIBUTION', 'CAUSAL', 'FINANCIAL_VALUE', 'DECISION')", name="chk_claim_type"),
        CheckConstraint("status IN ('DRAFT', 'ACTIVE', 'RETIRED')", name="chk_claim_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    claim_type: Mapped[str] = mapped_column(String(50), nullable=False)
    statement: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative: Mapped["Initiative"] = relationship()
    evidence_items: Mapped[List["Evidence"]] = relationship(back_populates="claim", cascade="all, delete-orphan")
    strength_assessments: Mapped[List["EvidenceStrengthAssessment"]] = relationship(back_populates="claim", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_evidence_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "claim_id"],
            ["claims.organization_id", "claims.id"],
            ondelete="RESTRICT",
            name="fk_evidence_claim_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="RESTRICT",
            name="fk_evidence_initiative_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "observation_id"],
            ["observations.organization_id", "observations.id"],
            ondelete="RESTRICT",
            name="fk_evidence_observation_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "source_file_id"],
            ["source_files.organization_id", "source_files.id"],
            ondelete="RESTRICT",
            name="fk_evidence_source_file_composite"
        ),
        CheckConstraint(
            "(source_type = 'OBSERVATION' AND observation_id IS NOT NULL AND source_file_id IS NULL) OR "
            "(source_type = 'FILE' AND source_file_id IS NOT NULL AND observation_id IS NULL) OR "
            "(source_type NOT IN ('OBSERVATION', 'FILE') AND observation_id IS NULL AND source_file_id IS NULL)",
            name="chk_evidence_source_type_invariants"
        ),
        CheckConstraint("stance IN ('SUPPORTS', 'CONFLICTS', 'CONTEXT')", name="chk_evidence_stance"),
        CheckConstraint("evidence_level IN ('E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6')", name="chk_evidence_level"),
        CheckConstraint("validation_state IN ('UNVALIDATED', 'VALIDATED', 'REJECTED')", name="chk_evidence_validation"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    claim_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    evidence_level: Mapped[str] = mapped_column(String(10), nullable=False)
    stance: Mapped[str] = mapped_column(String(50), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    observation_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    source_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    source_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    method: Mapped[Optional[str]] = mapped_column(nullable=True)
    scope: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    period_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    assumptions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    limitations: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    validation_state: Mapped[str] = mapped_column(String(50), default="UNVALIDATED", nullable=False)
    validated_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    claim: Mapped["Claim"] = relationship(back_populates="evidence_items")
    initiative: Mapped["Initiative"] = relationship()


class EvidenceStrengthAssessment(Base):
    __tablename__ = "evidence_strength_assessments"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_strength_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "claim_id"],
            ["claims.organization_id", "claims.id"],
            ondelete="RESTRICT",
            name="fk_strength_claim_composite"
        ),
        CheckConstraint("state IN ('LIMITED', 'MODERATE', 'STRONG')", name="chk_strength_state"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    claim_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    factors: Mapped[dict] = mapped_column(JSONB, nullable=False)
    confounders: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    method_version: Mapped[str] = mapped_column(String(50), nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    reviewed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    claim: Mapped["Claim"] = relationship(back_populates="strength_assessments")


class Intervention(Base):
    __tablename__ = "interventions"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_interventions_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="RESTRICT",
            name="fk_interventions_initiative_composite"
        ),
        CheckConstraint("action_type IN ('ROUTING_CHANGE', 'SCOPE_CHANGE', 'BUDGET_CHANGE', 'PROCESS_CHANGE', 'OTHER')", name="chk_intervention_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    effective_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative: Mapped["Initiative"] = relationship()


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_reviews_tenant"),
        UniqueConstraint("organization_id", "id", "initiative_id", name="uq_reviews_initiative_composite"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="RESTRICT",
            name="fk_reviews_initiative_composite"
        ),
        CheckConstraint("review_type IN ('INVESTMENT', 'SCHEDULED', 'EXCEPTION', 'POST_DECISION')", name="chk_review_type"),
        CheckConstraint("status IN ('DRAFT', 'READY', 'IN_REVIEW', 'COMPLETED', 'CANCELLED')", name="chk_review_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    review_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    decision_question: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative: Mapped["Initiative"] = relationship()
    snapshots: Mapped[List["ReviewSnapshot"]] = relationship(back_populates="review", cascade="all, delete-orphan")


class ReviewSnapshot(Base):
    __tablename__ = "review_snapshots"
    __table_args__ = (
        UniqueConstraint("organization_id", "review_id", "snapshot_version", name="uq_review_snapshots_tenant"),
        UniqueConstraint("organization_id", "initiative_id", "id", name="uq_snapshots_init_composite"),
        ForeignKeyConstraint(
            ["organization_id", "review_id", "initiative_id"],
            ["reviews.organization_id", "reviews.id", "reviews.initiative_id"],
            ondelete="RESTRICT",
            name="fk_snapshots_review_initiative_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_version_id"],
            ["initiative_versions.organization_id", "initiative_versions.id"],
            ondelete="RESTRICT",
            name="fk_snapshots_init_version_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "investment_id"],
            ["investments.organization_id", "investments.id"],
            ondelete="RESTRICT",
            name="fk_snapshots_investment_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    review_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    snapshot_version: Mapped[int] = mapped_column(Integer, nullable=False)
    initiative_version_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    investment_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    measurement_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    data_quality_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    evidence_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    assumptions_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    review: Mapped["Review"] = relationship(back_populates="snapshots")


class AIRun(Base):
    __tablename__ = "ai_runs"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_ai_runs_tenant"),
        CheckConstraint("task_type IN ('DRAFT_SUMMARY', 'INVESTIGATE', 'SUGGEST_MAPPING', 'EXPLAIN_RECOMMENDATION')", name="chk_ai_task_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    prompt_template_version: Mapped[str] = mapped_column(String(50), nullable=False)
    model_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)
    token_count_input: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    token_count_output: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_recommendations_tenant"),
        UniqueConstraint("organization_id", "id", "initiative_id", name="uq_recommendations_initiative_composite"),
        UniqueConstraint("organization_id", "review_snapshot_id", "version_number", name="uq_recommendation_version"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id", "review_snapshot_id"],
            ["review_snapshots.organization_id", "review_snapshots.initiative_id", "review_snapshots.id"],
            ondelete="RESTRICT",
            name="fk_recommendations_snapshot_composite"
        ),
        CheckConstraint("recommendation_type IN ('SCALE', 'KEEP', 'OPTIMIZE', 'STOP', 'CONTINUE_MEASUREMENT')", name="chk_rec_type"),
        CheckConstraint("support_state IN ('SUPPORTED', 'SUPPORTED_WITH_CONDITIONS', 'CONFLICTING', 'INSUFFICIENT')", name="chk_support_state"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    review_snapshot_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    recommendation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    support_state: Mapped[str] = mapped_column(String(50), nullable=False)
    rationale: Mapped[str] = mapped_column(nullable=False)
    conditions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    policy_version: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_contributed: Mapped[bool] = mapped_column(default=False, nullable=False)
    ai_run_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("ai_runs.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Decision(Base):
    __tablename__ = "decisions"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_decisions_tenant"),
        UniqueConstraint("organization_id", "id", "initiative_id", name="uq_decisions_initiative_composite"),
        ForeignKeyConstraint(
            ["organization_id", "review_id", "initiative_id"],
            ["reviews.organization_id", "reviews.id", "reviews.initiative_id"],
            ondelete="RESTRICT",
            name="fk_decisions_review_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "recommendation_id", "initiative_id"],
            ["recommendations.organization_id", "recommendations.id", "recommendations.initiative_id"],
            ondelete="SET NULL",
            name="fk_decisions_recommendation_composite"
        ),
        CheckConstraint("decision_type IN ('APPROVE', 'REJECT', 'SCALE', 'KEEP', 'OPTIMIZE', 'STOP', 'DEFER', 'REQUEST_ANALYSIS', 'OTHER')", name="chk_decision_type"),
        CheckConstraint("decision_source IN ('IN_PRODUCT', 'EXTERNAL')", name="chk_decision_source"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    review_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    recommendation_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    decision_type: Mapped[str] = mapped_column(String(50), nullable=False)
    decision_source: Mapped[str] = mapped_column(String(50), nullable=False)
    rationale: Mapped[Optional[str]] = mapped_column(nullable=True)
    conditions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    decided_by_user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    decided_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    external_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class DecisionExpectation(Base):
    __tablename__ = "decision_expectations"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_dec_expectations_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "decision_id", "initiative_id"],
            ["decisions.organization_id", "decisions.id", "decisions.initiative_id"],
            ondelete="CASCADE",
            name="fk_expectations_decision_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_metric_id", "initiative_id"],
            ["initiative_metrics.organization_id", "initiative_metrics.id", "initiative_metrics.initiative_id"],
            ondelete="RESTRICT",
            name="fk_expectations_metric_composite"
        ),
        CheckConstraint("period_end > period_start", name="chk_expectations_dates"),
        CheckConstraint("expected_value IS NOT NULL OR expected_change IS NOT NULL", name="chk_expectations_values"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    decision_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    initiative_metric_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    expected_value: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    expected_change: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    assumptions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Outcome(Base):
    __tablename__ = "outcomes"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_outcomes_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "decision_id", "initiative_id"],
            ["decisions.organization_id", "decisions.id", "decisions.initiative_id"],
            ondelete="SET NULL",
            name="fk_outcomes_decision_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "initiative_metric_id", "initiative_id"],
            ["initiative_metrics.organization_id", "initiative_metrics.id", "initiative_metrics.initiative_id"],
            ondelete="RESTRICT",
            name="fk_outcomes_metric_composite"
        ),
        ForeignKeyConstraint(
            ["organization_id", "observation_id", "initiative_id"],
            ["observations.organization_id", "observations.id", "observations.initiative_id"],
            ondelete="RESTRICT",
            name="fk_outcomes_observation_composite"
        ),
        CheckConstraint("validation_state IN ('UNVALIDATED', 'VALIDATED', 'DISPUTED')", name="chk_outcome_validation"),
        CheckConstraint(
            "(validation_state = 'UNVALIDATED' AND validated_by_user_id IS NULL AND validated_at IS NULL AND rejection_reason IS NULL) OR "
            "(validation_state = 'VALIDATED' AND validated_by_user_id IS NOT NULL AND validated_at IS NOT NULL AND rejection_reason IS NULL) OR "
            "(validation_state = 'DISPUTED' AND rejection_reason IS NOT NULL AND LTRIM(rejection_reason) != '')",
            name="chk_outcome_validation_fields"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    decision_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    initiative_metric_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    observation_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    variance_from_expected: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    validation_state: Mapped[str] = mapped_column(String(50), default="UNVALIDATED", nullable=False)
    validated_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Learning(Base):
    __tablename__ = "learnings"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_learnings_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="RESTRICT",
            name="fk_learnings_initiative"
        ),
        ForeignKeyConstraint(
            ["organization_id", "decision_id", "initiative_id"],
            ["decisions.organization_id", "decisions.id", "decisions.initiative_id"],
            ondelete="SET NULL",
            name="fk_learnings_decision_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    decision_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    summary: Mapped[str] = mapped_column(nullable=False)
    evidence_strength_state: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    applicability: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class GovernanceApproval(Base):
    __tablename__ = "governance_approvals"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_governance_approvals_tenant"),
        UniqueConstraint("organization_id", "id", "initiative_id", name="uq_governance_approvals_composite"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="CASCADE",
            name="fk_governance_approvals_init_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    requested_by: Mapped[str] = mapped_column(String(255), nullable=False)
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    current_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    requested_budget: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    expected_outcome: Mapped[Optional[str]] = mapped_column(nullable=True)
    ai_confidence_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False)
    submitted_date: Mapped[datetime_date] = mapped_column(Date, nullable=False)
    due_date: Mapped[datetime_date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    initiative: Mapped["Initiative"] = relationship()
    tasks: Mapped[List["WorkflowTask"]] = relationship(back_populates="approval", cascade="all, delete-orphan")
    comments: Mapped[List["WorkflowComment"]] = relationship(back_populates="approval", cascade="all, delete-orphan")
    audit_logs: Mapped[List["WorkflowAuditLog"]] = relationship(back_populates="approval", cascade="all, delete-orphan")


class WorkflowTask(Base):
    __tablename__ = "workflow_tasks"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_workflow_tasks_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "approval_id"],
            ["governance_approvals.organization_id", "governance_approvals.id"],
            ondelete="CASCADE",
            name="fk_workflow_tasks_approval_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    approval_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    task_title: Mapped[str] = mapped_column(String(255), nullable=False)
    assignee: Mapped[str] = mapped_column(String(255), nullable=False)
    due_date: Mapped[datetime_date] = mapped_column(Date, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    approval: Mapped["GovernanceApproval"] = relationship(back_populates="tasks")


class WorkflowComment(Base):
    __tablename__ = "workflow_comments"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_workflow_comments_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "approval_id"],
            ["governance_approvals.organization_id", "governance_approvals.id"],
            ondelete="CASCADE",
            name="fk_workflow_comments_approval_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    approval_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    approval: Mapped["GovernanceApproval"] = relationship(back_populates="comments")


class WorkflowAuditLog(Base):
    __tablename__ = "workflow_audit_logs"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_workflow_audit_logs_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "approval_id"],
            ["governance_approvals.organization_id", "governance_approvals.id"],
            ondelete="CASCADE",
            name="fk_workflow_audit_logs_approval_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    approval_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    previous_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    new_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    approval: Mapped["GovernanceApproval"] = relationship(back_populates="audit_logs")


class FinancialBenefit(Base):
    __tablename__ = "financial_benefits"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_financial_benefits_tenant"),
        ForeignKeyConstraint(
            ["organization_id", "initiative_id"],
            ["initiatives.organization_id", "initiatives.id"],
            ondelete="CASCADE",
            name="fk_financial_benefits_init_composite"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    initiative_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    benefit_name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    target_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    actual_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    variance_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    evidence_source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
