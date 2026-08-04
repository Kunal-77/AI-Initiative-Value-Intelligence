import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class MetricVersionResponse(BaseModel):
    id: uuid.UUID
    metric_definition_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    version_number: int
    unit: str
    value_type: str
    improvement_direction: str
    aggregation_method: str
    formula_spec: Optional[dict] = None
    scope_rules: Optional[dict] = None
    time_grain: str
    effective_from: datetime
    effective_to: Optional[datetime] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MetricDefinitionCreate(BaseModel):
    canonical_key: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    description: str
    unit: str = Field(..., max_length=50)
    value_type: str = Field("DECIMAL", description="DECIMAL, INTEGER, MONEY, PERCENT, DURATION")
    improvement_direction: str = Field("INCREASE", description="INCREASE, DECREASE, RANGE, NONE")
    aggregation_method: str = Field("AVG", description="SUM, AVG, RATIO, CUSTOM")
    time_grain: str = Field("MONTH", description="DAY, WEEK, MONTH, REVIEW_PERIOD")

class MetricDefinitionResponse(BaseModel):
    id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    canonical_key: str
    name: str
    description: str
    created_at: datetime
    latest_version: Optional[MetricVersionResponse] = None

    model_config = ConfigDict(from_attributes=True)

class InitiativeMetricCreate(BaseModel):
    metric_definition_id: uuid.UUID
    role: str = Field(..., description="PRIMARY_KPI, GUARDRAIL, SECONDARY, CONTEXT")
    target_type: str = Field("ABSOLUTE", description="ABSOLUTE, RELATIVE, RANGE, DIRECTIONAL")
    target_value: Optional[float] = None
    target_lower: Optional[float] = None
    target_upper: Optional[float] = None
    threshold_operator: Optional[str] = Field(None, description="GREATER_THAN, LESS_THAN, GREATER_EQUAL, LESS_EQUAL, EQUAL, BETWEEN")
    review_period: Optional[str] = Field(None, max_length=100)

class InitiativeMetricUpdate(BaseModel):
    role: Optional[str] = Field(None, description="PRIMARY_KPI, GUARDRAIL, SECONDARY, CONTEXT")
    target_type: Optional[str] = Field(None, description="ABSOLUTE, RELATIVE, RANGE, DIRECTIONAL")
    target_value: Optional[float] = None
    target_lower: Optional[float] = None
    target_upper: Optional[float] = None
    threshold_operator: Optional[str] = Field(None, description="GREATER_THAN, LESS_THAN, GREATER_EQUAL, LESS_EQUAL, EQUAL, BETWEEN")
    review_period: Optional[str] = Field(None, max_length=100)

class BaselineCreate(BaseModel):
    value: float
    period_start: datetime
    period_end: datetime
    scope: Optional[dict] = None
    baseline_type: str = Field("PRE_DEPLOYMENT", description="PRE_DEPLOYMENT, RECONSTRUCTED, OTHER")
    source_method: str

class BaselineResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_metric_id: uuid.UUID
    version_number: int
    value: float
    period_start: datetime
    period_end: datetime
    scope: Optional[dict] = None
    baseline_type: str
    source_method: str
    status: str
    approved_by_user_id: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None
    change_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InitiativeMetricResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_id: uuid.UUID
    metric_version_id: uuid.UUID
    role: str
    target_type: str
    target_value: Optional[float] = None
    target_lower: Optional[float] = None
    target_upper: Optional[float] = None
    threshold_operator: Optional[str] = None
    review_period: Optional[str] = None
    validator_user_id: Optional[uuid.UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime
    canonical_key: Optional[str] = None
    name: Optional[str] = None
    baselines: List[BaselineResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Baseline schemas moved above InitiativeMetricResponse


class DataSourceCreate(BaseModel):
    name: str = Field(..., max_length=255)
    source_type: str = Field("CSV", description="CSV, PARQUET, MANUAL, CONNECTOR")
    provider: Optional[str] = Field(None, max_length=100)
    configuration: Optional[dict] = None

class DataSourceResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    source_type: str
    provider: Optional[str] = None
    health_state: str
    last_success_at: Optional[datetime] = None
    configuration: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SourceFileResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    data_source_id: uuid.UUID
    object_key: str
    original_filename: str
    content_type: str
    size_bytes: int
    checksum: str
    classification: Optional[str] = None
    uploaded_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class IngestionRunCreate(BaseModel):
    source_file_id: uuid.UUID
    idempotency_key: Optional[str] = None

class IngestionRunResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    data_source_id: uuid.UUID
    source_file_id: uuid.UUID
    idempotency_key: Optional[str] = None
    status: str
    mapping_snapshot: Optional[dict] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    rows_received: int
    rows_accepted: int
    rows_rejected: int
    error_summary: Optional[dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ColumnMappingSubmit(BaseModel):
    metric_version_id: uuid.UUID
    timestamp_column: str
    value_column: str
    currency_column: Optional[str] = None
    scope_filters: Optional[dict] = None
    date_format_pattern: Optional[str] = Field(None, description="e.g. %Y-%m-%d")

class ObservationCreate(BaseModel):
    value: float
    period_start: datetime
    period_end: datetime
    scope: Optional[dict] = None
    observation_type: str = Field("MANUAL", description="MANUAL, OBSERVED, DERIVED, RECONSTRUCTED")
    source_reference: Optional[str] = Field(None, max_length=255)

class ObservationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    initiative_metric_id: uuid.UUID
    metric_version_id: uuid.UUID
    initiative_id: uuid.UUID
    data_source_id: Optional[uuid.UUID] = None
    ingestion_run_id: Optional[uuid.UUID] = None
    source_row_index: Optional[int] = None
    value: float
    currency: Optional[str] = None
    period_start: datetime
    period_end: datetime
    scope: Optional[dict] = None
    observation_type: str
    calculation_version: Optional[str] = None
    source_reference: Optional[str] = None
    validation_state: str
    validated_by_user_id: Optional[uuid.UUID] = None
    validated_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_by_user_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ObservationValidation(BaseModel):
    rejection_reason: Optional[str] = None

class DataQualityAssessmentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    data_source_id: Optional[uuid.UUID] = None
    ingestion_run_id: Optional[uuid.UUID] = None
    initiative_metric_id: Optional[uuid.UUID] = None
    state: str
    completeness: Optional[dict] = None
    freshness: Optional[dict] = None
    validity: Optional[dict] = None
    consistency: Optional[dict] = None
    coverage: Optional[dict] = None
    comparability: Optional[dict] = None
    provenance: Optional[dict] = None
    issues: Optional[dict] = None
    method_version: str
    assessed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnalyticsFinancials(BaseModel):
    planned_investment: float
    actual_investment: float
    variance: float
    currency: str

class AnalyticsKPI(BaseModel):
    initiative_metric_id: uuid.UUID
    metric_name: str
    role: str
    baseline: float
    current: float
    change_absolute: Optional[float] = None
    change_percent: Optional[float] = None
    target_attained: bool

class AnalyticsGuardrail(BaseModel):
    initiative_metric_id: uuid.UUID
    metric_name: str
    role: str
    baseline: float
    current: float
    breached: bool

class DeterministicAnalyticsSummaryResponse(BaseModel):
    initiative_id: uuid.UUID
    lifecycle_state: str
    financials: Optional[AnalyticsFinancials] = None
    kpis: List[AnalyticsKPI] = []
    guardrails: List[AnalyticsGuardrail] = []
    calculation_version: str

