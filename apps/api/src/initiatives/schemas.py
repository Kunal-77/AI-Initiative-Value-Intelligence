import uuid
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class InitiativeCreate(BaseModel):
    name: str = Field(..., max_length=255)
    business_area: Optional[str] = Field(None, max_length=255)
    problem_statement: Optional[str] = None
    proposed_intervention: Optional[str] = None
    expected_business_outcome: Optional[str] = None
    planned_start_date: Optional[date] = None
    owner: Optional[str] = Field(None, max_length=255)
    executive_sponsor: Optional[str] = Field(None, max_length=255)
    project_lead: Optional[str] = Field(None, max_length=255)
    target_metric_name: Optional[str] = Field(None, max_length=255)
    target_metric_value: Optional[str] = Field(None, max_length=255)

class InitiativeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    business_area: Optional[str] = Field(None, max_length=255)
    owner_user_id: Optional[uuid.UUID] = None
    problem_statement: Optional[str] = None
    proposed_intervention: Optional[str] = None
    expected_business_outcome: Optional[str] = None
    planned_start_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    next_review_at: Optional[datetime] = None
    owner: Optional[str] = Field(None, max_length=255)
    executive_sponsor: Optional[str] = Field(None, max_length=255)
    project_lead: Optional[str] = Field(None, max_length=255)
    target_metric_name: Optional[str] = Field(None, max_length=255)
    target_metric_value: Optional[str] = Field(None, max_length=255)

class InitiativeResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    business_area: Optional[str] = None
    owner_user_id: Optional[uuid.UUID] = None
    lifecycle_state: str
    problem_statement: Optional[str] = None
    proposed_intervention: Optional[str] = None
    expected_business_outcome: Optional[str] = None
    planned_start_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    next_review_at: Optional[datetime] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    owner: Optional[str] = None
    executive_sponsor: Optional[str] = None
    project_lead: Optional[str] = None
    target_metric_name: Optional[str] = None
    target_metric_value: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class InitiativeVersionResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    version_number: int
    business_case_snapshot: dict
    change_reason: Optional[str] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CostItemCreate(BaseModel):
    category: str = Field(..., description="SOFTWARE, INFRASTRUCTURE, LABOR, OTHER")
    value_type: str = Field(..., description="PLANNED, ACTUAL, MODELED")
    amount: float = Field(..., ge=0.00)
    currency: str = Field("USD", min_length=3, max_length=3)
    recurrence: str = Field("ONE_TIME", description="ONE_TIME, MONTHLY, ANNUAL")
    source_reference: Optional[str] = Field(None, max_length=255)
    assumption_note: Optional[str] = None
    expense_name: Optional[str] = Field(None, max_length=255)
    vendor: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=255)
    date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)
    approval_owner: Optional[str] = Field(None, max_length=255)

class CostItemResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    investment_id: uuid.UUID
    category: str
    value_type: str
    amount: float
    currency: str
    recurrence: str
    source_reference: Optional[str] = None
    assumption_note: Optional[str] = None
    expense_name: Optional[str] = None
    vendor: Optional[str] = None
    department: Optional[str] = None
    date: Optional[date] = None
    status: Optional[str] = None
    approval_owner: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class InvestmentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    version_number: int
    currency: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    status: str
    assumptions: Optional[dict] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime
    total_planned_amount: float
    total_actual_amount: float
    cost_items: List[CostItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class InterventionCreate(BaseModel):
    action_type: str = Field(..., description="ROUTING_CHANGE, SCOPE_CHANGE, BUDGET_CHANGE, PROCESS_CHANGE, OTHER")
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    reason: Optional[str] = None
    effective_at: datetime

class InterventionResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    action_type: str
    title: str
    description: Optional[str] = None
    reason: Optional[str] = None
    effective_at: datetime
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClaimCreate(BaseModel):
    claim_type: str = Field(..., description="DESCRIPTIVE, CHANGE, ASSOCIATION, ATTRIBUTION, CAUSAL, FINANCIAL_VALUE, DECISION")
    statement: str

class ClaimResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    claim_type: str
    statement: str
    status: str
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceCreate(BaseModel):
    evidence_level: str = Field(..., description="E0 to E6")
    stance: str = Field(..., description="SUPPORTS, CONFLICTS, CONTEXT")
    source_type: str = Field(..., description="OBSERVATION, FILE, ANALYSIS, MANUAL, REVIEW")
    observation_id: Optional[uuid.UUID] = None
    source_file_id: Optional[uuid.UUID] = None
    source_reference: Optional[str] = Field(None, max_length=255)
    method: Optional[str] = None
    scope: Optional[dict] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    assumptions: Optional[dict] = None
    limitations: Optional[dict] = None

class EvidenceResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    claim_id: uuid.UUID
    evidence_level: str
    stance: str
    source_type: str
    observation_id: Optional[uuid.UUID] = None
    source_file_id: Optional[uuid.UUID] = None
    source_reference: Optional[str] = None
    method: Optional[str] = None
    scope: Optional[dict] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    assumptions: Optional[dict] = None
    limitations: Optional[dict] = None
    validation_state: str
    validated_by_user_id: Optional[uuid.UUID] = None
    validated_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceStrengthAssessmentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    claim_id: uuid.UUID
    state: str
    factors: dict
    confounders: Optional[dict] = None
    method_version: str
    assessed_at: datetime
    reviewed_by_user_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    review_type: str = Field(..., description="INVESTMENT, SCHEDULED, EXCEPTION, POST_DECISION")
    scheduled_at: Optional[datetime] = None
    decision_question: Optional[str] = None

class ReviewResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    review_type: str
    status: str
    scheduled_at: Optional[datetime] = None
    decision_question: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewReadinessResponse(BaseModel):
    ready: bool
    blockers: List[str]
    review: ReviewResponse


class ReviewSnapshotResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    review_id: uuid.UUID
    initiative_id: uuid.UUID
    snapshot_version: int
    initiative_version_id: uuid.UUID
    investment_id: Optional[uuid.UUID] = None
    measurement_snapshot: dict
    data_quality_snapshot: dict
    evidence_snapshot: dict
    assumptions_snapshot: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    review_snapshot_id: uuid.UUID
    version_number: int
    recommendation_type: str
    support_state: str
    rationale: str
    conditions: Optional[dict] = None
    policy_version: str
    ai_contributed: bool
    ai_run_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIDraftSummaryResponse(BaseModel):
    draft_text: str
    source_references: List[str]
    ai_run_id: uuid.UUID


class AIInvestigateResponse(BaseModel):
    questions: List[str]
    confounders: List[str]
    ai_run_id: uuid.UUID


class AIExplanationResponse(BaseModel):
    explanation: str
    structured_factors: dict
    ai_run_id: uuid.UUID


class AIRunResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    task_type: str
    prompt_template_version: str
    model_provider: str
    model_name: str
    token_count_input: Optional[int] = None
    token_count_output: Optional[int] = None
    latency_ms: Optional[int] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DecisionCreate(BaseModel):
    decision_type: str = Field(..., description="APPROVE, REJECT, SCALE, KEEP, OPTIMIZE, STOP, DEFER, REQUEST_ANALYSIS, OTHER")
    recommendation_id: Optional[uuid.UUID] = None
    rationale: Optional[str] = None
    conditions: Optional[dict] = None
    external_reference: Optional[str] = None
    decision_source: Optional[str] = "IN_PRODUCT"


class DecisionResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    review_id: Optional[uuid.UUID] = None
    recommendation_id: Optional[uuid.UUID] = None
    decision_type: str
    decision_source: str
    rationale: Optional[str] = None
    conditions: Optional[dict] = None
    decided_by_user_id: uuid.UUID
    decided_at: datetime
    external_reference: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DecisionExpectationCreate(BaseModel):
    initiative_metric_id: uuid.UUID
    expected_value: Optional[float] = None
    expected_change: Optional[float] = None
    period_start: datetime
    period_end: datetime
    assumptions: Optional[dict] = None


class DecisionExpectationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    decision_id: uuid.UUID
    initiative_metric_id: uuid.UUID
    expected_value: Optional[float] = None
    expected_change: Optional[float] = None
    period_start: datetime
    period_end: datetime
    assumptions: Optional[dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OutcomeCreate(BaseModel):
    initiative_metric_id: uuid.UUID
    observation_id: uuid.UUID


class OutcomeResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    decision_id: Optional[uuid.UUID] = None
    initiative_metric_id: uuid.UUID
    observation_id: uuid.UUID
    variance_from_expected: Optional[float] = None
    validation_state: str
    validated_by_user_id: Optional[uuid.UUID] = None
    validated_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LearningResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    decision_id: Optional[uuid.UUID] = None
    summary: str
    evidence_strength_state: Optional[str] = None
    applicability: Optional[dict] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalItemResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    requested_by: str
    owner: str
    current_stage: str
    requested_budget: float
    expected_outcome: Optional[str] = None
    ai_confidence_score: Optional[float] = None
    risk_level: str
    submitted_date: date
    due_date: date

    model_config = ConfigDict(from_attributes=True)


class WorkflowTaskResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    approval_id: uuid.UUID
    task_title: str
    assignee: str
    due_date: date
    priority: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class WorkflowCommentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    approval_id: uuid.UUID
    author: str
    role: str
    content: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowCommentCreate(BaseModel):
    content: str


class WorkflowAuditLogResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    approval_id: uuid.UUID
    actor: str
    action: str
    previous_stage: str
    new_stage: str
    reason: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class GovernanceMetricsResponse(BaseModel):
    approvalThroughputCount: int
    averageApprovalTimeDays: float
    rejectionPercentage: int
    pendingPercentage: int
    escalationsCount: int
    bottleneckStage: str
    overdueReviewsCount: int


class ExecutiveFinancialMetricsResponse(BaseModel):
    totalPlannedInvestment: float
    totalActualSpend: float
    totalExpectedBenefit: float
    totalRealizedBenefit: float
    overallPortfolioRoi: float
    budgetVariancePercentage: float
    benefitRealizationPercentage: float
    topCostDriver: Optional[str] = None
    largestSavingInitiative: Optional[str] = None


class BenefitItemResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    initiative_name: str
    benefit_name: str
    owner: Optional[str] = None
    category: str
    target_amount: float
    actual_amount: float
    variance_amount: float
    status: str
    evidence_source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CostItemLedgerResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    initiative_name: str
    expense_name: Optional[str] = None
    vendor: Optional[str] = None
    department: Optional[str] = None
    category: str
    planned_amount: float
    actual_amount: float
    variance_amount: float
    date: Optional[date] = None
    status: Optional[str] = None
    approval_owner: Optional[str] = None
