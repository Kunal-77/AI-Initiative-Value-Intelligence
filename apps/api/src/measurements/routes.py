import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from src.core.database import get_db
from src.identity.authorization import AuthorizationContext, require_capability
from src.measurements.schemas import (
    MetricDefinitionCreate,
    MetricDefinitionResponse,
    MetricVersionResponse,
    InitiativeMetricCreate,
    InitiativeMetricUpdate,
    InitiativeMetricResponse,
    BaselineCreate,
    BaselineResponse,
    DataSourceCreate,
    DataSourceResponse,
    SourceFileResponse,
    IngestionRunCreate,
    IngestionRunResponse,
    ColumnMappingSubmit,
    ObservationCreate,
    ObservationResponse,
    ObservationValidation,
    DataQualityAssessmentResponse,
    DeterministicAnalyticsSummaryResponse
)
from src.measurements.service import MeasurementsService
from src.measurements.models import MetricVersion, Observation
from src.initiatives.service import InitiativesService
from fastapi import UploadFile, File, BackgroundTasks
from src.core.database import SessionLocal

router = APIRouter(tags=["Measurements"])

@router.post("/metrics", response_model=MetricDefinitionResponse, status_code=status.HTTP_201_CREATED)
def create_metric_definition(
    data: MetricDefinitionCreate,
    context: AuthorizationContext = Depends(require_capability("manage_settings")),
    db: Session = Depends(get_db)
):
    """
    Registers a new metric definition and assigns its version 1 properties.
    """
    metric = MeasurementsService.create_metric_definition(
        db=db,
        context=context,
        canonical_key=data.canonical_key,
        name=data.name,
        description=data.description,
        unit=data.unit,
        value_type=data.value_type,
        improvement_direction=data.improvement_direction,
        aggregation_method=data.aggregation_method,
        time_grain=data.time_grain
    )
    
    # Load latest version to construct the nested schema
    latest_ver = metric.versions[-1] if metric.versions else None
    ver_res = None
    if latest_ver:
        ver_res = MetricVersionResponse.model_validate(latest_ver)
        
    return MetricDefinitionResponse(
        id=metric.id,
        organization_id=metric.organization_id,
        canonical_key=metric.canonical_key,
        name=metric.name,
        description=metric.description,
        created_at=metric.created_at,
        latest_version=ver_res
    )

@router.get("/metrics", response_model=List[MetricDefinitionResponse])
def list_metric_definitions(
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    """
    Lists all metric definitions including tenant metrics and allowed global templates.
    """
    metrics = MeasurementsService.list_metric_definitions(db=db, org_id=context.active_organization_id)
    res = []
    for metric in metrics:
        latest_ver = metric.versions[-1] if metric.versions else None
        ver_res = None
        if latest_ver:
            ver_res = MetricVersionResponse.model_validate(latest_ver)
        res.append(
            MetricDefinitionResponse(
                id=metric.id,
                organization_id=metric.organization_id,
                canonical_key=metric.canonical_key,
                name=metric.name,
                description=metric.description,
                created_at=metric.created_at,
                latest_version=ver_res
            )
        )
    return res

@router.post("/initiatives/{id}/metrics", response_model=InitiativeMetricResponse, status_code=status.HTTP_201_CREATED)
def assign_initiative_metric(
    id: uuid.UUID,
    data: InitiativeMetricCreate,
    context: AuthorizationContext = Depends(require_capability("create_initiative")),
    db: Session = Depends(get_db)
):
    """
    Links a metric definition version to an initiative, declaring role and targets.
    """
    assignment = MeasurementsService.assign_initiative_metric(
        db=db,
        context=context,
        initiative_id=id,
        metric_definition_id=data.metric_definition_id,
        role=data.role,
        target_type=data.target_type,
        target_value=data.target_value,
        target_lower=data.target_lower,
        target_upper=data.target_upper,
        threshold_operator=data.threshold_operator,
        review_period=data.review_period
    )
    
    # Get associated definition info for name/key mapping
    stmt = select(MetricVersion).where(MetricVersion.id == assignment.metric_version_id)
    m_ver = db.scalars(stmt).first()
    canonical_key = m_ver.definition.canonical_key if m_ver else None
    name = m_ver.definition.name if m_ver else None
    
    return InitiativeMetricResponse(
        id=assignment.id,
        organization_id=assignment.organization_id,
        initiative_id=assignment.initiative_id,
        metric_version_id=assignment.metric_version_id,
        role=assignment.role,
        target_type=assignment.target_type,
        target_value=assignment.target_value,
        target_lower=assignment.target_lower,
        target_upper=assignment.target_upper,
        threshold_operator=assignment.threshold_operator,
        review_period=assignment.review_period,
        validator_user_id=assignment.validator_user_id,
        status=assignment.status,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
        canonical_key=canonical_key,
        name=name
    )

@router.patch("/initiatives/{id}/metrics/{initiative_metric_id}", response_model=InitiativeMetricResponse)
def update_initiative_metric(
    id: uuid.UUID,
    initiative_metric_id: uuid.UUID,
    data: InitiativeMetricUpdate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    """
    Updates an initiative metric assignment.
    """
    update_dict = data.model_dump(exclude_unset=True)
    assignment = MeasurementsService.update_initiative_metric(
        db=db,
        context=context,
        initiative_id=id,
        initiative_metric_id=initiative_metric_id,
        data=update_dict
    )
    # Get associated definition info for name/key mapping
    stmt = select(MetricVersion).where(MetricVersion.id == assignment.metric_version_id)
    m_ver = db.scalars(stmt).first()
    canonical_key = m_ver.definition.canonical_key if m_ver else None
    name = m_ver.definition.name if m_ver else None
    
    return InitiativeMetricResponse(
        id=assignment.id,
        organization_id=assignment.organization_id,
        initiative_id=assignment.initiative_id,
        metric_version_id=assignment.metric_version_id,
        role=assignment.role,
        target_type=assignment.target_type,
        target_value=assignment.target_value,
        target_lower=assignment.target_lower,
        target_upper=assignment.target_upper,
        threshold_operator=assignment.threshold_operator,
        review_period=assignment.review_period,
        validator_user_id=assignment.validator_user_id,
        status=assignment.status,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
        canonical_key=canonical_key,
        name=name
    )

@router.delete("/initiatives/{id}/metrics/{initiative_metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_initiative_metric(
    id: uuid.UUID,
    initiative_metric_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    """
    Deletes an initiative metric assignment.
    """
    MeasurementsService.delete_initiative_metric(
        db=db,
        context=context,
        initiative_id=id,
        initiative_metric_id=initiative_metric_id
    )

@router.post("/initiatives/{id}/metrics/{initiative_metric_id}/retire", response_model=InitiativeMetricResponse)
def retire_initiative_metric(
    id: uuid.UUID,
    initiative_metric_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    """
    Retires an initiative metric assignment.
    """
    assignment = MeasurementsService.retire_initiative_metric(
        db=db,
        context=context,
        initiative_id=id,
        initiative_metric_id=initiative_metric_id
    )
    # Get associated definition info for name/key mapping
    stmt = select(MetricVersion).where(MetricVersion.id == assignment.metric_version_id)
    m_ver = db.scalars(stmt).first()
    canonical_key = m_ver.definition.canonical_key if m_ver else None
    name = m_ver.definition.name if m_ver else None
    
    return InitiativeMetricResponse(
        id=assignment.id,
        organization_id=assignment.organization_id,
        initiative_id=assignment.initiative_id,
        metric_version_id=assignment.metric_version_id,
        role=assignment.role,
        target_type=assignment.target_type,
        target_value=assignment.target_value,
        target_lower=assignment.target_lower,
        target_upper=assignment.target_upper,
        threshold_operator=assignment.threshold_operator,
        review_period=assignment.review_period,
        validator_user_id=assignment.validator_user_id,
        status=assignment.status,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
        canonical_key=canonical_key,
        name=name
    )

@router.get("/initiatives/{id}/metrics", response_model=List[InitiativeMetricResponse])
def list_assigned_metrics(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    """
    Lists all metrics assigned to an initiative, checking tenant boundaries.
    """
    # Enforce tenant check on parent initiative
    InitiativesService.get_initiative(db, context.active_organization_id, id)
    
    assignments = MeasurementsService.list_assigned_metrics(db=db, org_id=context.active_organization_id, initiative_id=id)
    res = []
    for assignment in assignments:
        stmt = select(MetricVersion).where(MetricVersion.id == assignment.metric_version_id)
        m_ver = db.scalars(stmt).first()
        canonical_key = m_ver.definition.canonical_key if m_ver else None
        name = m_ver.definition.name if m_ver else None
        res.append(
            InitiativeMetricResponse(
                id=assignment.id,
                organization_id=assignment.organization_id,
                initiative_id=assignment.initiative_id,
                metric_version_id=assignment.metric_version_id,
                role=assignment.role,
                target_type=assignment.target_type,
                target_value=assignment.target_value,
                target_lower=assignment.target_lower,
                target_upper=assignment.target_upper,
                threshold_operator=assignment.threshold_operator,
                review_period=assignment.review_period,
                validator_user_id=assignment.validator_user_id,
                status=assignment.status,
                created_at=assignment.created_at,
                updated_at=assignment.updated_at,
                canonical_key=canonical_key,
                name=name,
                baselines=[BaselineResponse.model_validate(b) for b in assignment.baselines]
            )
        )
    return res

@router.post("/initiatives/{id}/metrics/{init_metric_id}/baseline", response_model=BaselineResponse, status_code=status.HTTP_201_CREATED)
def create_baseline(
    id: uuid.UUID,
    init_metric_id: uuid.UUID,
    data: BaselineCreate,
    context: AuthorizationContext = Depends(require_capability("create_initiative")),
    db: Session = Depends(get_db)
):
    """
    Registers a new baseline reference benchmark for an assigned metric.
    """
    # Verify tenant bounds on parent initiative
    InitiativesService.get_initiative(db, context.active_organization_id, id)
    
    return MeasurementsService.create_baseline(
        db=db,
        context=context,
        initiative_metric_id=init_metric_id,
        value=data.value,
        period_start=data.period_start,
        period_end=data.period_end,
        scope=data.scope,
        baseline_type=data.baseline_type,
        source_method=data.source_method
    )

@router.post("/initiatives/{id}/metrics/{init_metric_id}/baseline/{baseline_id}/approve", response_model=BaselineResponse)
def approve_baseline(
    id: uuid.UUID,
    init_metric_id: uuid.UUID,
    baseline_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    """
    Approves a baseline. Automatically marks any older approved baseline as SUPERSEDED.
    """
    # Verify tenant bounds on parent initiative
    InitiativesService.get_initiative(db, context.active_organization_id, id)
    # Verify tenant bounds on metric
    MeasurementsService.get_assigned_metric(db, context.active_organization_id, init_metric_id)
    
    return MeasurementsService.approve_baseline(
        db=db,
        context=context,
        baseline_id=baseline_id
    )

# --- Data Sources & Ingestion ---

@router.post("/data-sources", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
def create_data_source(
    data: DataSourceCreate,
    context: AuthorizationContext = Depends(require_capability("manage_sources")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.create_data_source(
        db=db,
        context=context,
        name=data.name,
        source_type=data.source_type,
        provider=data.provider,
        configuration=data.configuration
    )

@router.get("/data-sources", response_model=List[DataSourceResponse])
def list_data_sources(
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.list_data_sources(db=db, org_id=context.active_organization_id)

@router.get("/data-sources/{id}", response_model=DataSourceResponse)
def get_data_source(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.get_data_source(db=db, org_id=context.active_organization_id, source_id=id)

@router.post("/uploads", response_model=SourceFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    data_source_id: uuid.UUID,
    file: UploadFile = File(...),
    context: AuthorizationContext = Depends(require_capability("ingest_data")),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    return MeasurementsService.upload_source_file(
        db=db,
        context=context,
        data_source_id=data_source_id,
        original_filename=file.filename,
        content_type=file.content_type,
        size_bytes=len(file_bytes),
        checksum=None,
        file_bytes=file_bytes
    )

@router.post("/data-sources/{id}/imports", response_model=IngestionRunResponse, status_code=status.HTTP_202_ACCEPTED)
def create_ingestion_run(
    id: uuid.UUID,
    data: IngestionRunCreate,
    context: AuthorizationContext = Depends(require_capability("ingest_data")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.create_ingestion_run(
        db=db,
        context=context,
        data_source_id=id,
        source_file_id=data.source_file_id,
        idempotency_key=data.idempotency_key
    )

@router.get("/imports/{id}", response_model=IngestionRunResponse)
def get_ingestion_run(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.get_ingestion_run(db=db, org_id=context.active_organization_id, run_id=id)

@router.get("/imports/{id}/errors")
def get_ingestion_run_errors(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    run = MeasurementsService.get_ingestion_run(db=db, org_id=context.active_organization_id, run_id=id)
    return run.error_summary or {"errors": []}

@router.post("/imports/{id}/mapping", response_model=IngestionRunResponse)
def save_column_mapping(
    id: uuid.UUID,
    data: ColumnMappingSubmit,
    context: AuthorizationContext = Depends(require_capability("ingest_data")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.save_column_mapping(
        db=db,
        context=context,
        run_id=id,
        mapping_snapshot=data.model_dump(mode="json")
    )

@router.post("/imports/{id}/process", response_model=IngestionRunResponse, status_code=status.HTTP_202_ACCEPTED)
def process_ingestion_run(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    context: AuthorizationContext = Depends(require_capability("ingest_data")),
    db: Session = Depends(get_db)
):
    # Verify run exists and belongs to tenant
    run = MeasurementsService.get_ingestion_run(db=db, org_id=context.active_organization_id, run_id=id)
    if run.status != "QUEUED":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only QUEUED runs can start processing.")
    if not run.mapping_snapshot:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mapping configuration is missing. Submit mapping before processing.")

    # Schedule Background Task
    background_tasks.add_task(
        MeasurementsService.process_run_in_background,
        SessionLocal,
        run.id
    )

    # Return updated run (will transition status locally for response representation)
    run.status = "RUNNING"
    run.started_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(run)
    return run

# --- Observations & Analytics ---

@router.post("/initiative-metrics/{id}/observations", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def create_manual_observation(
    id: uuid.UUID,
    data: ObservationCreate,
    context: AuthorizationContext = Depends(require_capability("ingest_data")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.create_manual_observation(
        db=db,
        context=context,
        init_metric_id=id,
        value=data.value,
        period_start=data.period_start,
        period_end=data.period_end,
        observation_type=data.observation_type,
        source_reference=data.source_reference
    )

@router.get("/observations/{id}", response_model=ObservationResponse)
def get_observation(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    stmt = select(Observation).where(Observation.organization_id == context.active_organization_id, Observation.id == id)
    obs = db.scalars(stmt).first()
    if not obs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found.")
    return obs

@router.post("/observations/{id}/validate", response_model=ObservationResponse)
def validate_observation(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.validate_observation(db=db, context=context, observation_id=id)

@router.post("/observations/{id}/reject", response_model=ObservationResponse)
def reject_observation(
    id: uuid.UUID,
    data: ObservationValidation,
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.reject_observation(db=db, context=context, observation_id=id, reason=data.rejection_reason)

@router.get("/initiatives/{id}/analytics/summary", response_model=DeterministicAnalyticsSummaryResponse)
def get_analytics_summary(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.get_analytics_summary(db=db, org_id=context.active_organization_id, initiative_id=id)

@router.get("/initiatives/{id}/data-quality", response_model=DataQualityAssessmentResponse)
def get_data_quality(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return MeasurementsService.get_data_quality_summary(db=db, org_id=context.active_organization_id, initiative_id=id)

@router.get("/initiative-metrics/{id}/analytics")
def get_metric_analytics(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    # Verify tenant bounds on metric
    im = MeasurementsService.get_assigned_metric(db, context.active_organization_id, id)
    obs_stmt = select(Observation).where(
        Observation.initiative_metric_id == im.id,
        Observation.validation_state == "VALIDATED"
    ).order_by(Observation.period_start.asc())
    obs_list = db.scalars(obs_stmt).all()
    
    return {
        "initiative_metric_id": id,
        "observations": [
            {
                "id": o.id,
                "value": float(o.value),
                "period_start": o.period_start,
                "period_end": o.period_end
            }
            for o in obs_list
        ]
    }

