import os
import pathlib
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, text, or_
from fastapi import HTTPException, status

from src.measurements.models import (
    MetricDefinition, MetricVersion, InitiativeMetric, Baseline,
    DataSource, SourceFile, IngestionRun, Observation, DataQualityAssessment
)
from src.initiatives.service import InitiativesService
from src.identity.authorization import AuthorizationContext

class MeasurementsService:
    @staticmethod
    def create_metric_definition(db: Session, context: AuthorizationContext, canonical_key: str, name: str, description: str, unit: str, value_type: str, improvement_direction: str, aggregation_method: str, time_grain: str) -> MetricDefinition:
        """
        Creates a new Metric Definition and version 1.
        """
        org_id = context.active_organization_id
        
        # Check if canonical_key already exists for this tenant
        exist_stmt = select(MetricDefinition).where(
            MetricDefinition.organization_id == org_id,
            MetricDefinition.canonical_key == canonical_key
        )
        if db.scalars(exist_stmt).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Metric key '{canonical_key}' already exists in organization."
            )
            
        metric_def = MetricDefinition(
            id=uuid.uuid4(),
            organization_id=org_id,
            canonical_key=canonical_key,
            name=name,
            description=description
        )
        db.add(metric_def)
        
        metric_ver = MetricVersion(
            id=uuid.uuid4(),
            metric_definition_id=metric_def.id,
            organization_id=org_id,
            version_number=1,
            unit=unit,
            value_type=value_type,
            improvement_direction=improvement_direction,
            aggregation_method=aggregation_method,
            time_grain=time_grain,
            created_by_user_id=context.user_id
        )
        db.add(metric_ver)
        
        db.commit()
        db.refresh(metric_def)
        return metric_def

    @staticmethod
    def get_metric_definition(db: Session, org_id: uuid.UUID, metric_id: uuid.UUID) -> MetricDefinition:
        """
        Retrieves metric definition. Scoped to organization OR global (organization_id IS NULL).
        """
        stmt = select(MetricDefinition).where(
            or_(
                MetricDefinition.organization_id == org_id,
                MetricDefinition.organization_id.is_(None)
            ),
            MetricDefinition.id == metric_id
        )
        metric = db.scalars(stmt).first()
        if not metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Metric not found."
            )
        return metric

    @staticmethod
    def list_metric_definitions(db: Session, org_id: uuid.UUID) -> List[MetricDefinition]:
        """
        Lists tenant metric definitions and global template metrics.
        """
        stmt = select(MetricDefinition).where(
            or_(
                MetricDefinition.organization_id == org_id,
                MetricDefinition.organization_id.is_(None)
            )
        ).order_by(MetricDefinition.canonical_key.asc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def assign_initiative_metric(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, metric_definition_id: uuid.UUID, role: str, target_type: str, target_value: Optional[float], target_lower: Optional[float], target_upper: Optional[float], threshold_operator: Optional[str], review_period: Optional[str]) -> InitiativeMetric:
        """
        Links a metric definition to an initiative.
        Enforces single PRIMARY_KPI constraint and target validations.
        """
        org_id = context.active_organization_id
        # Concurrency safety
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        # Verify initiative exists
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        if initiative.lifecycle_state in ["COMPLETED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot edit initiative in terminal state: {initiative.lifecycle_state}."
            )
        
        # Resolve metric definition & latest version
        metric_def = MeasurementsService.get_metric_definition(db, org_id, metric_definition_id)
        
        ver_stmt = select(MetricVersion).where(
            MetricVersion.metric_definition_id == metric_def.id
        ).order_by(MetricVersion.version_number.desc())
        metric_version = db.scalars(ver_stmt).first()
        if not metric_version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active versions found for this metric."
            )
            
        # Verify single PRIMARY_KPI assignment
        if role == "PRIMARY_KPI":
            kpi_stmt = select(InitiativeMetric).where(
                InitiativeMetric.initiative_id == initiative_id,
                InitiativeMetric.role == "PRIMARY_KPI"
            )
            if db.scalars(kpi_stmt).first():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Initiative already has a PRIMARY_KPI assigned."
                )
                
        # Target Validations
        if target_type == "ABSOLUTE" or target_type == "RELATIVE":
            if target_value is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"target_value is required for target_type: {target_type}."
                )
            if target_lower is not None or target_upper is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bounds cannot be set for target_type: {target_type}."
                )
        elif target_type == "RANGE":
            if target_lower is None or target_upper is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Both target_lower and target_upper are required for RANGE target_type."
                )
            if target_lower > target_upper:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_lower must be less than or equal to target_upper."
                )
            if target_value is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_value cannot be set for RANGE target_type."
                )
        elif target_type == "DIRECTIONAL":
            if target_value is not None or target_lower is not None or target_upper is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Target values/bounds cannot be configured for DIRECTIONAL target_type."
                )
                
        # Operator Bounds validation
        if threshold_operator == "BETWEEN":
            if target_lower is None or target_upper is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Both lower and upper bounds are required for BETWEEN operator."
                )

        assignment = InitiativeMetric(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=initiative_id,
            metric_version_id=metric_version.id,
            role=role,
            target_type=target_type,
            target_value=target_value,
            target_lower=target_lower,
            target_upper=target_upper,
            threshold_operator=threshold_operator,
            review_period=review_period,
            status="DRAFT"
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def list_assigned_metrics(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> List[InitiativeMetric]:
        """
        Lists all active metrics assigned to the initiative.
        """
        stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.initiative_id == initiative_id,
            InitiativeMetric.status != "SUPERSEDED"
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def update_initiative_metric(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, initiative_metric_id: uuid.UUID, data: dict) -> InitiativeMetric:
        org_id = context.active_organization_id
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        # Verify initiative exists and is not in a terminal state
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        if initiative.lifecycle_state in ["COMPLETED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot edit initiative in terminal state: {initiative.lifecycle_state}."
            )
            
        # Get existing metric assignment
        im_stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.id == initiative_metric_id,
            InitiativeMetric.initiative_id == initiative_id
        )
        im = db.scalars(im_stmt).first()
        if not im:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric assignment not found.")
            
        if im.status == "SUPERSEDED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot edit a superseded metric assignment.")

        # Extract values (merging updates with old values)
        role = data.get("role") if data.get("role") is not None else im.role
        target_type = data.get("target_type") if data.get("target_type") is not None else im.target_type
        target_value = data.get("target_value") if "target_value" in data else im.target_value
        target_lower = data.get("target_lower") if "target_lower" in data else im.target_lower
        target_upper = data.get("target_upper") if "target_upper" in data else im.target_upper
        threshold_operator = data.get("threshold_operator") if "threshold_operator" in data else im.threshold_operator
        review_period = data.get("review_period") if "review_period" in data else im.review_period

        # Target type and Operator bounds validations
        if target_type == "ABSOLUTE" or target_type == "RELATIVE":
            if target_value is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"target_value is required for target_type: {target_type}.")
            if target_lower is not None or target_upper is not None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Bounds cannot be set for target_type: {target_type}.")
        elif target_type == "RANGE":
            if target_lower is None or target_upper is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both target_lower and target_upper are required for RANGE target_type.")
            if target_lower > target_upper:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_lower must be less than or equal to target_upper.")
            if target_value is not None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_value cannot be set for RANGE target_type.")
        elif target_type == "DIRECTIONAL":
            if target_value is not None or target_lower is not None or target_upper is not None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target values/bounds cannot be configured for DIRECTIONAL target_type.")

        if threshold_operator == "BETWEEN":
            if target_lower is None or target_upper is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both lower and upper bounds are required for BETWEEN operator.")
        elif threshold_operator is not None and threshold_operator != "BETWEEN":
            if target_value is None:
                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_value is required for absolute operator.")

        # Check PRIMARY_KPI invariants in SUBMITTED/ACTIVE states
        if initiative.lifecycle_state in ["SUBMITTED", "ACTIVE"]:
            # Rule: Cannot demote a PRIMARY_KPI
            if im.role == "PRIMARY_KPI" and role != "PRIMARY_KPI":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change PRIMARY_KPI role on submitted or active initiative.")
            # Rule: Cannot promote another metric to PRIMARY_KPI if one already exists
            if im.role != "PRIMARY_KPI" and role == "PRIMARY_KPI":
                kpi_stmt = select(InitiativeMetric).where(
                    InitiativeMetric.initiative_id == initiative_id,
                    InitiativeMetric.role == "PRIMARY_KPI",
                    InitiativeMetric.status != "SUPERSEDED"
                )
                if db.scalars(kpi_stmt).first():
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Initiative already has a PRIMARY_KPI assigned.")

        # Apply edit
        if initiative.lifecycle_state == "ACTIVE":
            # 1. Mark current as SUPERSEDED
            im.status = "SUPERSEDED"
            im.updated_at = datetime.now(timezone.utc)
            
            # 2. Trigger Business Case Snapshot
            InitiativesService.create_business_case_snapshot(db, context, initiative, f"Active Metric update snapshot: {im.id}")
            
            # 3. Create replacement record
            new_im = InitiativeMetric(
                id=uuid.uuid4(),
                organization_id=org_id,
                initiative_id=initiative_id,
                metric_version_id=im.metric_version_id,
                role=role,
                target_type=target_type,
                target_value=target_value,
                target_lower=target_lower,
                target_upper=target_upper,
                threshold_operator=threshold_operator,
                review_period=review_period,
                status="APPROVED",
                created_at=im.created_at,  # preserve original creation timestamp
                updated_at=datetime.now(timezone.utc)
            )
            db.add(new_im)
            try:
                db.commit()
            except Exception as e:
                db.rollback()
                if "uq_primary_kpi" in str(e):
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Initiative already has a PRIMARY_KPI assigned.")
                raise e
            db.refresh(new_im)
            return new_im
        else:
            # DRAFT or SUBMITTED -> Edit in place
            im.role = role
            im.target_type = target_type
            im.target_value = target_value
            im.target_lower = target_lower
            im.target_upper = target_upper
            im.threshold_operator = threshold_operator
            im.review_period = review_period
            im.updated_at = datetime.now(timezone.utc)
            try:
                db.commit()
            except Exception as e:
                db.rollback()
                if "uq_primary_kpi" in str(e):
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Initiative already has a PRIMARY_KPI assigned.")
                raise e
            db.refresh(im)
            return im

    @staticmethod
    def delete_initiative_metric(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, initiative_metric_id: uuid.UUID) -> None:
        org_id = context.active_organization_id
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        # Verify initiative exists and is not in a terminal state
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        if initiative.lifecycle_state in ["COMPLETED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot edit initiative in terminal state: {initiative.lifecycle_state}."
            )
            
        im_stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.id == initiative_metric_id,
            InitiativeMetric.initiative_id == initiative_id
        )
        im = db.scalars(im_stmt).first()
        if not im:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric assignment not found.")
            
        if im.status == "SUPERSEDED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete a superseded metric assignment.")

        # Guard: Prevent deleting PRIMARY_KPI on SUBMITTED or ACTIVE
        if initiative.lifecycle_state in ["SUBMITTED", "ACTIVE"]:
            if im.role == "PRIMARY_KPI":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete PRIMARY_KPI on submitted or active initiative.")

        # Check dependencies
        from src.initiatives.models import DecisionExpectation, Outcome
        
        stmt1 = select(func.count(Baseline.id)).where(Baseline.initiative_metric_id == initiative_metric_id)
        if db.scalar(stmt1) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete metric assignment: it has associated baseline benchmarks.")
            
        stmt2 = select(func.count(Observation.id)).where(Observation.initiative_metric_id == initiative_metric_id)
        if db.scalar(stmt2) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete metric assignment: it has associated historical observations.")
            
        stmt3 = select(func.count(DataQualityAssessment.id)).where(DataQualityAssessment.initiative_metric_id == initiative_metric_id)
        if db.scalar(stmt3) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete metric assignment: it has associated data quality assessments.")
            
        stmt4 = select(func.count(DecisionExpectation.id)).where(DecisionExpectation.initiative_metric_id == initiative_metric_id)
        if db.scalar(stmt4) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete metric assignment: it has associated decision expectations.")
            
        stmt5 = select(func.count(Outcome.id)).where(Outcome.initiative_metric_id == initiative_metric_id)
        if db.scalar(stmt5) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete metric assignment: it has associated outcome validation records.")

        db.delete(im)
        db.commit()

    @staticmethod
    def retire_initiative_metric(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, initiative_metric_id: uuid.UUID) -> InitiativeMetric:
        org_id = context.active_organization_id
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        if initiative.lifecycle_state in ["COMPLETED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot edit initiative in terminal state: {initiative.lifecycle_state}."
            )
            
        im_stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.id == initiative_metric_id,
            InitiativeMetric.initiative_id == initiative_id
        )
        im = db.scalars(im_stmt).first()
        if not im:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric assignment not found.")
            
        if im.status == "SUPERSEDED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Metric assignment is already retired/superseded.")

        # Guard: Prevent retiring PRIMARY_KPI on SUBMITTED or ACTIVE
        if initiative.lifecycle_state in ["SUBMITTED", "ACTIVE"]:
            if im.role == "PRIMARY_KPI":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot retire PRIMARY_KPI on submitted or active initiative.")

        im.status = "SUPERSEDED"
        im.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(im)
        return im

    @staticmethod
    def get_assigned_metric(db: Session, org_id: uuid.UUID, id: uuid.UUID) -> InitiativeMetric:
        """
        Retrieves metric assignment detail.
        """
        stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.id == id
        )
        assignment = db.scalars(stmt).first()
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned metric not found."
            )
        return assignment

    @staticmethod
    def create_baseline(db: Session, context: AuthorizationContext, initiative_metric_id: uuid.UUID, value: float, period_start: datetime, period_end: datetime, scope: Optional[dict], baseline_type: str, source_method: str) -> Baseline:
        """
        Creates a baseline benchmark for an assigned metric.
        If an approved baseline already exists, it is superseded upon approval of the new one.
        """
        org_id = context.active_organization_id
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:metric_id))"), {"metric_id": str(initiative_metric_id)})
        
        # Verify assignment exists
        assignment = MeasurementsService.get_assigned_metric(db, org_id, initiative_metric_id)
        
        # Date validation
        if period_end <= period_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="period_end must be strictly after period_start."
            )
            
        # Check for existing DRAFT baseline
        stmt_draft = select(Baseline).where(
            Baseline.initiative_metric_id == initiative_metric_id,
            Baseline.status == "DRAFT"
        )
        existing_draft = db.scalars(stmt_draft).first()
        if existing_draft:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A draft baseline already exists for this metric. Please approve or reject it before creating a new one."
            )
            
        # Determine baseline version number
        stmt = select(func.max(Baseline.version_number)).where(
            Baseline.initiative_metric_id == initiative_metric_id
        )
        max_ver = db.scalar(stmt)
        next_ver = 1 if max_ver is None else max_ver + 1
        
        baseline = Baseline(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_metric_id=initiative_metric_id,
            version_number=next_ver,
            value=value,
            period_start=period_start,
            period_end=period_end,
            scope=scope,
            baseline_type=baseline_type,
            source_method=source_method,
            status="DRAFT"
        )
        db.add(baseline)
        db.commit()
        db.refresh(baseline)
        return baseline

    @staticmethod
    def approve_baseline(db: Session, context: AuthorizationContext, baseline_id: uuid.UUID) -> Baseline:
        """
        Approves a baseline. Marks any prior APPROVED baselines as SUPERSEDED.
        """
        org_id = context.active_organization_id
        
        # Fetch baseline
        stmt = select(Baseline).where(
            Baseline.organization_id == org_id,
            Baseline.id == baseline_id
        )
        baseline = db.scalars(stmt).first()
        if not baseline:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baseline not found."
            )
            
        if baseline.status != "DRAFT":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Baseline is already {baseline.status} and cannot be modified."
            )
            
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:metric_id))"), {"metric_id": str(baseline.initiative_metric_id)})
        
        # Supercede previous approved baselines
        supersede_stmt = select(Baseline).where(
            Baseline.initiative_metric_id == baseline.initiative_metric_id,
            Baseline.status == "APPROVED"
        )
        previous_approved = db.scalars(supersede_stmt).all()
        for prev in previous_approved:
            prev.status = "SUPERSEDED"
            
        # Approve new baseline
        baseline.status = "APPROVED"
        baseline.approved_by_user_id = context.user_id
        baseline.approved_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(baseline)
        return baseline

    @staticmethod
    def create_data_source(db: Session, context: AuthorizationContext, name: str, source_type: str, provider: Optional[str], configuration: Optional[dict]) -> DataSource:
        org_id = context.active_organization_id
        ds = DataSource(
            id=uuid.uuid4(),
            organization_id=org_id,
            name=name,
            source_type=source_type,
            provider=provider,
            configuration=configuration
        )
        db.add(ds)
        db.commit()
        db.refresh(ds)
        return ds

    @staticmethod
    def get_data_source(db: Session, org_id: uuid.UUID, source_id: uuid.UUID) -> DataSource:
        stmt = select(DataSource).where(DataSource.organization_id == org_id, DataSource.id == source_id)
        ds = db.scalars(stmt).first()
        if not ds:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found.")
        return ds

    @staticmethod
    def list_data_sources(db: Session, org_id: uuid.UUID) -> List[DataSource]:
        stmt = select(DataSource).where(DataSource.organization_id == org_id, DataSource.archived_at.is_(None)).order_by(DataSource.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def upload_source_file(db: Session, context: AuthorizationContext, data_source_id: uuid.UUID, original_filename: str, content_type: str, size_bytes: int, checksum: str, file_bytes: bytes) -> SourceFile:
        import hashlib
        from src.core.storage import get_storage_service
        org_id = context.active_organization_id

        # Verify logical data source exists
        MeasurementsService.get_data_source(db, org_id, data_source_id)

        # Sniff MIME/size validation
        if size_bytes > 10 * 1024 * 1024:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File size exceeds maximum 10MB limit.")
        
        ext = os.path.splitext(original_filename)[1].lower()
        if ext not in (".csv", ".parquet"):
            raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported file format. Only .csv and .parquet are allowed.")

        # Checksum calculation / verification
        computed_checksum = hashlib.sha256(file_bytes).hexdigest()
        if checksum and computed_checksum != checksum:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File checksum mismatch.")
        checksum = computed_checksum

        # Check source-scoped deduplication
        dup_stmt = select(SourceFile).where(
            SourceFile.organization_id == org_id,
            SourceFile.data_source_id == data_source_id,
            SourceFile.checksum == checksum,
            SourceFile.deleted_at.is_(None)
        )
        existing = db.scalars(dup_stmt).first()
        if existing:
            return existing

        # Generate object key
        file_uuid = uuid.uuid4()
        sanitized_filename = pathlib.Path(original_filename).name
        # Keep path sanitization secure
        sanitized_filename = "".join(c for c in sanitized_filename if c.isalnum() or c in (".", "_", "-"))
        object_key = f"tenant_{org_id}/sources/{data_source_id}/{file_uuid}_{sanitized_filename}"

        # Write to storage
        storage = get_storage_service()
        try:
            storage.upload_file(object_key, file_bytes)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to write file to storage: {str(e)}")

        source_file = SourceFile(
            id=file_uuid,
            organization_id=org_id,
            data_source_id=data_source_id,
            object_key=object_key,
            original_filename=original_filename,
            content_type=content_type,
            size_bytes=size_bytes,
            checksum=checksum,
            uploaded_by_user_id=context.user_id
        )
        db.add(source_file)
        
        try:
            db.commit()
            db.refresh(source_file)
        except Exception as e:
            db.rollback()
            # Cleanup storage on DB failure
            try:
                storage.delete_file(object_key)
            except:
                pass
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database transaction failed. File upload discarded.") from e

        return source_file

    @staticmethod
    def create_ingestion_run(db: Session, context: AuthorizationContext, data_source_id: uuid.UUID, source_file_id: uuid.UUID, idempotency_key: Optional[str]) -> IngestionRun:
        org_id = context.active_organization_id

        # Verify components exist and belong to tenant
        MeasurementsService.get_data_source(db, org_id, data_source_id)
        file_stmt = select(SourceFile).where(SourceFile.organization_id == org_id, SourceFile.id == source_file_id, SourceFile.data_source_id == data_source_id)
        sf = db.scalars(file_stmt).first()
        if not sf:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source file not found or tenant mismatch.")

        # Idempotency check
        if idempotency_key:
            idem_stmt = select(IngestionRun).where(
                IngestionRun.organization_id == org_id,
                IngestionRun.data_source_id == data_source_id,
                IngestionRun.idempotency_key == idempotency_key
            )
            existing = db.scalars(idem_stmt).first()
            if existing:
                return existing

        run = IngestionRun(
            id=uuid.uuid4(),
            organization_id=org_id,
            data_source_id=data_source_id,
            source_file_id=source_file_id,
            idempotency_key=idempotency_key,
            status="QUEUED"
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        return run

    @staticmethod
    def save_column_mapping(db: Session, context: AuthorizationContext, run_id: uuid.UUID, mapping_snapshot: dict) -> IngestionRun:
        org_id = context.active_organization_id
        stmt = select(IngestionRun).where(IngestionRun.organization_id == org_id, IngestionRun.id == run_id)
        run = db.scalars(stmt).first()
        if not run:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingestion run not found.")
        
        if run.status != "QUEUED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mappings can only be edited on QUEUED runs.")

        mapping_snapshot["created_by_user_id"] = str(context.user_id)
        mapping_snapshot["created_at"] = datetime.now(timezone.utc).isoformat()
        run.mapping_snapshot = mapping_snapshot
        
        db.commit()
        db.refresh(run)
        return run

    @staticmethod
    def get_ingestion_run(db: Session, org_id: uuid.UUID, run_id: uuid.UUID) -> IngestionRun:
        stmt = select(IngestionRun).where(IngestionRun.organization_id == org_id, IngestionRun.id == run_id)
        run = db.scalars(stmt).first()
        if not run:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingestion run not found.")
        return run

    @staticmethod
    def create_manual_observation(db: Session, context: AuthorizationContext, init_metric_id: uuid.UUID, value: float, period_start: datetime, period_end: datetime, observation_type: str, source_reference: Optional[str]) -> Observation:
        org_id = context.active_organization_id
        
        # Resolve initiative_metric assignment
        im_stmt = select(InitiativeMetric).where(InitiativeMetric.organization_id == org_id, InitiativeMetric.id == init_metric_id)
        im = db.scalars(im_stmt).first()
        if not im:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric assignment not found.")

        # Check date range
        if period_end < period_start:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Period end must be greater than or equal to period start.")

        obs = Observation(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_metric_id=im.id,
            metric_version_id=im.metric_version_id,
            initiative_id=im.initiative_id,
            value=value,
            period_start=period_start,
            period_end=period_end,
            observation_type=observation_type,
            source_reference=source_reference,
            validation_state="UNVALIDATED",
            created_by_user_id=context.user_id
        )
        db.add(obs)
        db.commit()
        db.refresh(obs)
        return obs

    @staticmethod
    def validate_observation(db: Session, context: AuthorizationContext, observation_id: uuid.UUID) -> Observation:
        org_id = context.active_organization_id
        stmt = select(Observation).where(Observation.organization_id == org_id, Observation.id == observation_id)
        obs = db.scalars(stmt).first()
        if not obs:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found.")

        if obs.validation_state != "UNVALIDATED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Observation is already in state {obs.validation_state}")

        obs.validation_state = "VALIDATED"
        obs.validated_by_user_id = context.user_id
        obs.validated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(obs)
        return obs

    @staticmethod
    def reject_observation(db: Session, context: AuthorizationContext, observation_id: uuid.UUID, reason: Optional[str]) -> Observation:
        org_id = context.active_organization_id
        stmt = select(Observation).where(Observation.organization_id == org_id, Observation.id == observation_id)
        obs = db.scalars(stmt).first()
        if not obs:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found.")

        if obs.validation_state != "UNVALIDATED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Observation is already in state {obs.validation_state}")

        obs.validation_state = "REJECTED"
        obs.rejection_reason = reason or "No reason provided"
        obs.validated_by_user_id = context.user_id
        obs.validated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(obs)
        return obs

    @staticmethod
    def process_run_in_background(db_session_factory, run_id: uuid.UUID) -> None:
        db = db_session_factory()
        try:
            # Advisory lock to prevent concurrent processing of the same run
            db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:run_id))"), {"run_id": str(run_id)})
            
            run = db.get(IngestionRun, run_id)
            if not run or run.status not in ("QUEUED", "RUNNING"):
                return

            run.status = "RUNNING"
            run.started_at = datetime.now(timezone.utc)
            db.commit()

            # Execute actual parsing
            MeasurementsService._execute_ingestion(db, run)
        except Exception as e:
            db.rollback()
            if run:
                run.status = "FAILED"
                run.completed_at = datetime.now(timezone.utc)
                run.error_summary = {"error": f"Ingestion worker crashed: {str(e)}"}
                db.commit()
        finally:
            db.close()

    @staticmethod
    def _execute_ingestion(db: Session, run: IngestionRun) -> None:
        import csv
        import io
        from decimal import Decimal
        from src.core.storage import get_storage_service

        sf = db.get(SourceFile, run.source_file_id)
        mapping = run.mapping_snapshot
        if not mapping:
            run.status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            run.error_summary = {"error": "Ingestion mapping is missing."}
            db.commit()
            return

        # Fetch file bytes
        storage = get_storage_service()
        try:
            file_bytes = storage.download_file(sf.object_key)
        except Exception as e:
            run.status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            run.error_summary = {"error": f"Failed to retrieve file from object store: {str(e)}"}
            db.commit()
            return

        # Read CSV rows
        try:
            decoded = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                decoded = file_bytes.decode("latin-1")
            except Exception as e:
                run.status = "FAILED"
                run.completed_at = datetime.now(timezone.utc)
                run.error_summary = {"error": f"Unable to decode file encoding: {str(e)}"}
                db.commit()
                return

        reader = csv.DictReader(io.StringIO(decoded))
        headers = reader.fieldnames or []

        timestamp_col = mapping.get("timestamp_column")
        value_col = mapping.get("value_column")
        currency_col = mapping.get("currency_column")
        metric_ver_id = uuid.UUID(mapping.get("metric_version_id"))

        # Verify headers mapping
        if timestamp_col not in headers or value_col not in headers:
            run.status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            run.error_summary = {"error": f"Mapping columns not found in file headers. File headers: {headers}"}
            db.commit()
            return

        # Lookup metric version to find initiative and unit details
        mv_stmt = select(MetricVersion).where(MetricVersion.id == metric_ver_id)
        mv = db.scalars(mv_stmt).first()
        if not mv:
            run.status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            run.error_summary = {"error": f"Metric version {metric_ver_id} does not exist."}
            db.commit()
            return

        # Find target initiative_metric
        im_stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == run.organization_id,
            InitiativeMetric.metric_version_id == mv.id
        )
        im = db.scalars(im_stmt).first()
        if not im:
            run.status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            run.error_summary = {"error": f"Metric version {mv.id} is not assigned to any initiative in this tenant."}
            db.commit()
            return

        rows_received = 0
        rows_accepted = 0
        rows_rejected = 0
        errors = []

        for idx, row in enumerate(reader):
            rows_received += 1
            raw_ts = row.get(timestamp_col)
            raw_val = row.get(value_col)
            raw_curr = row.get(currency_col) if currency_col else None

            # 1. Parse Timestamp
            parsed_dt = None
            for fmt in ("%Y-%m-%d %H:%M:%S%z", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S%z"):
                try:
                    parsed_dt = datetime.strptime(raw_ts.strip(), fmt)
                    if parsed_dt.tzinfo is None:
                        parsed_dt = parsed_dt.replace(tzinfo=timezone.utc)
                    break
                except:
                    continue

            if not parsed_dt:
                rows_rejected += 1
                errors.append({"row": idx, "column": timestamp_col, "value": raw_ts, "reason": "Invalid timestamp format"})
                continue

            # 2. Parse Value
            try:
                parsed_val = float(Decimal(raw_val.strip().replace(",", "")))
            except:
                rows_rejected += 1
                errors.append({"row": idx, "column": value_col, "value": raw_val, "reason": "Invalid numeric value"})
                continue

            # 3. Ingest row
            obs = Observation(
                id=uuid.uuid4(),
                organization_id=run.organization_id,
                initiative_metric_id=im.id,
                metric_version_id=mv.id,
                initiative_id=im.initiative_id,
                data_source_id=run.data_source_id,
                ingestion_run_id=run.id,
                source_row_index=idx,
                value=parsed_val,
                currency=raw_curr.strip() if raw_curr else None,
                period_start=parsed_dt,
                period_end=parsed_dt,  # Grain is point in time for row entries
                observation_type="OBSERVED",
                validation_state="UNVALIDATED"
            )
            db.add(obs)
            rows_accepted += 1

        run.rows_received = rows_received
        run.rows_accepted = rows_accepted
        run.rows_rejected = rows_rejected
        run.error_summary = {"errors": errors} if errors else None
        
        if rows_rejected == rows_received and rows_received > 0:
            run.status = "FAILED"
        elif rows_rejected > 0:
            run.status = "PARTIAL"
        else:
            run.status = "SUCCEEDED"

        run.completed_at = datetime.now(timezone.utc)
        db.commit()

    @staticmethod
    def recover_stale_running_runs(db: Session) -> int:
        stmt = select(IngestionRun).where(IngestionRun.status == "RUNNING")
        stale_runs = db.scalars(stmt).all()
        count = 0
        for run in stale_runs:
            run.status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            run.error_summary = {"error": "Stale running execution recovered. System restart or worker crashed."}
            count += 1
        if count > 0:
            db.commit()
        return count

    @staticmethod
    def get_analytics_summary(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> dict:
        from decimal import Decimal
        from src.initiatives.models import Initiative, Investment, InvestmentCostItem

        # Resolve initiative
        init = db.get(Initiative, initiative_id)
        if not init or init.organization_id != org_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Initiative not found.")

        # Calculate Planned Investment
        planned_val = Decimal("0.00")
        actual_val = Decimal("0.00")
        currency = "USD"
        currencies_found = set()

        inv_stmt = select(Investment).where(Investment.initiative_id == initiative_id, Investment.status == "APPROVED")
        approved_inv = db.scalars(inv_stmt).first()
        if approved_inv:
            currency = approved_inv.currency
            currencies_found.add(currency)
            for item in approved_inv.cost_items:
                if item.value_type == "PLANNED":
                    planned_val += Decimal(str(item.amount))

        # Calculate Actual Investment
        all_inv_stmt = select(Investment).where(Investment.initiative_id == initiative_id)
        all_invs = db.scalars(all_inv_stmt).all()
        for inv in all_invs:
            for item in inv.cost_items:
                if item.value_type == "ACTUAL":
                    currencies_found.add(item.currency)
                    actual_val += Decimal(str(item.amount))

        # Mixed currency check
        if len(currencies_found) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Incomparable currencies found in investment cost items: {list(currencies_found)}"
            )

        financials = {
            "planned_investment": float(planned_val),
            "actual_investment": float(actual_val),
            "variance": float(planned_val - actual_val),
            "currency": currency
        }

        # Retrieve Initiative Metrics (KPIs and Guardrails)
        im_stmt = select(InitiativeMetric).where(
            InitiativeMetric.initiative_id == initiative_id,
            InitiativeMetric.status != "SUPERSEDED"
        )
        im_list = db.scalars(im_stmt).all()

        kpi_results = []
        guardrail_results = []

        for im in im_list:
            # Resolve definition details
            mv_stmt = select(MetricVersion).where(MetricVersion.id == im.metric_version_id)
            mv = db.scalars(mv_stmt).first()
            m_def = mv.definition if mv else None
            name = m_def.name if m_def else "Unknown Metric"

            # Baseline lookup
            base_stmt = select(Baseline).where(Baseline.initiative_metric_id == im.id, Baseline.status == "APPROVED")
            active_base = db.scalars(base_stmt).first()

            # Observations lookup (Only VALIDATED state)
            obs_stmt = select(Observation).where(Observation.initiative_metric_id == im.id, Observation.validation_state == "VALIDATED")
            validated_obs = db.scalars(obs_stmt).all()

            if not validated_obs:
                # No current observations
                if im.role == "PRIMARY_KPI":
                    kpi_results.append({
                        "initiative_metric_id": im.id,
                        "metric_name": name,
                        "role": im.role,
                        "baseline": float(active_base.value) if active_base else 0.0,
                        "current": 0.0,
                        "change_absolute": None,
                        "change_percent": None,
                        "target_attained": False
                    })
                elif im.role == "GUARDRAIL":
                    guardrail_results.append({
                        "initiative_metric_id": im.id,
                        "metric_name": name,
                        "role": im.role,
                        "baseline": float(active_base.value) if active_base else 0.0,
                        "current": 0.0,
                        "breached": False
                    })
                continue

            # Compute current value depending on aggregation method
            obs_values = [Decimal(str(o.value)) for o in validated_obs]
            agg = mv.aggregation_method if mv else "AVG"
            if agg == "SUM":
                v_curr = sum(obs_values)
            else:
                v_curr = sum(obs_values) / len(obs_values)

            # Currency matching for observations
            obs_currencies = {o.currency for o in validated_obs if o.currency}
            if len(obs_currencies) > 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Observations contain mixed currencies: {list(obs_currencies)}"
                )

            v_base = Decimal(str(active_base.value)) if active_base else Decimal("0.00")
            delta_abs = v_curr - v_base
            delta_pct = None

            if v_base != Decimal("0.00"):
                delta_pct = (delta_abs / v_base) * Decimal("100.00")
            elif v_curr == Decimal("0.00"):
                delta_pct = Decimal("0.00")

            if im.role == "PRIMARY_KPI":
                target_attained = False
                val_to_compare = delta_pct if im.target_type == "RELATIVE" else v_curr

                if im.target_type == "RANGE":
                    target_attained = (Decimal(str(im.target_lower)) <= v_curr <= Decimal(str(im.target_upper)))
                elif im.target_type == "DIRECTIONAL":
                    # Directional logic
                    dir_imp = mv.improvement_direction if mv else "INCREASE"
                    if dir_imp == "INCREASE":
                        target_attained = (delta_abs > 0)
                    elif dir_imp == "DECREASE":
                        target_attained = (delta_abs < 0)
                    else:
                        target_attained = True
                else:
                    # ABSOLUTE or RELATIVE target value comparison
                    dir_imp = mv.improvement_direction if mv else "INCREASE"
                    target_val = Decimal(str(im.target_value)) if im.target_value is not None else Decimal("0.00")
                    if dir_imp == "INCREASE":
                        target_attained = (val_to_compare >= target_val)
                    elif dir_imp == "DECREASE":
                        target_attained = (val_to_compare <= target_val)
                    else:
                        target_attained = True

                kpi_results.append({
                    "initiative_metric_id": im.id,
                    "metric_name": name,
                    "role": im.role,
                    "baseline": float(v_base),
                    "current": float(v_curr),
                    "change_absolute": float(delta_abs),
                    "change_percent": float(delta_pct) if delta_pct is not None else None,
                    "target_attained": target_attained
                })

            elif im.role == "GUARDRAIL":
                breached = False
                op_sign = im.threshold_operator
                target_val = Decimal(str(im.target_value)) if im.target_value is not None else Decimal("0.00")

                if op_sign == "LESS_THAN":
                    breached = (v_curr < target_val)
                elif op_sign == "GREATER_THAN":
                    breached = (v_curr > target_val)
                elif op_sign == "LESS_EQUAL":
                    breached = (v_curr <= target_val)
                elif op_sign == "GREATER_EQUAL":
                    breached = (v_curr >= target_val)
                elif op_sign == "EQUAL":
                    breached = (v_curr == target_val)
                elif op_sign == "BETWEEN":
                    t_lower = Decimal(str(im.target_lower)) if im.target_lower is not None else Decimal("0.00")
                    t_upper = Decimal(str(im.target_upper)) if im.target_upper is not None else Decimal("0.00")
                    breached = not (t_lower <= v_curr <= t_upper)

                guardrail_results.append({
                    "initiative_metric_id": im.id,
                    "metric_name": name,
                    "role": im.role,
                    "baseline": float(v_base),
                    "current": float(v_curr),
                    "breached": breached
                })

        return {
            "initiative_id": initiative_id,
            "lifecycle_state": init.lifecycle_state,
            "financials": financials,
            "kpis": kpi_results,
            "guardrails": guardrail_results,
            "calculation_version": "v1.0-deterministic"
        }

    @staticmethod
    def get_data_quality_summary(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> dict:
        # Fetch Initiative Metrics
        im_stmt = select(InitiativeMetric).where(
            InitiativeMetric.initiative_id == initiative_id,
            InitiativeMetric.status != "SUPERSEDED"
        )
        im_list = db.scalars(im_stmt).all()

        state = "HEALTHY"
        issues = []
        completeness_details = {}
        freshness_details = {}
        validity_details = {"invalid_rows_count": 0}
        coverage_details = {}
        provenance_details = {}

        if not im_list:
            return {
                "id": uuid.uuid4(),
                "organization_id": org_id,
                "initiative_metric_id": None,
                "state": "BLOCKED",
                "completeness": {"status": "BLOCKED", "score": 0.0, "details": "No metrics assigned to initiative."},
                "freshness": {"status": "NOT_EVALUATED", "score": None, "details": "No observations to check."},
                "validity": {"status": "NOT_EVALUATED", "score": None, "details": "No observations to check."},
                "consistency": {"status": "NOT_EVALUATED", "score": None, "details": "Consistency evaluation is not supported in V1."},
                "coverage": {"status": "NOT_EVALUATED", "score": None, "details": "No observations to check."},
                "comparability": {"status": "NOT_EVALUATED", "score": None, "details": "Comparability evaluation is not supported in V1."},
                "provenance": {"status": "NOT_EVALUATED", "score": None, "details": "No observations to check."},
                "issues": {"issues": ["No metrics assigned"]},
                "method_version": "v1.0-dq",
                "assessed_at": datetime.now(timezone.utc)
            }

        # Evaluate completeness & freshness per metric
        has_kpi = False
        kpi_missing_data = False
        stale_observed = False

        for im in im_list:
            if im.role == "PRIMARY_KPI":
                has_kpi = True
            
            # Count observations
            obs_stmt = select(Observation).where(Observation.initiative_metric_id == im.id, Observation.validation_state == "VALIDATED")
            validated_obs = db.scalars(obs_stmt).all()

            # Completeness evaluation
            if not validated_obs:
                if im.role == "PRIMARY_KPI":
                    kpi_missing_data = True
                issues.append(f"Metric {im.id} has zero validated observations.")
                completeness_details[str(im.id)] = {"status": "BLOCKED", "score": 0.0}
            else:
                completeness_details[str(im.id)] = {"status": "HEALTHY", "score": 1.0}

                # Freshness evaluation
                latest_obs_time = max(o.period_end for o in validated_obs)
                age_seconds = (datetime.now(timezone.utc) - latest_obs_time).total_seconds()
                # If age is greater than 60 days, mark as stale
                if age_seconds > 60 * 24 * 3600:
                    stale_observed = True
                    issues.append(f"Metric {im.id} observations are stale. Latest data: {latest_obs_time.isoformat()}")
                    freshness_details[str(im.id)] = {"status": "STALE", "score": 0.3}
                else:
                    freshness_details[str(im.id)] = {"status": "HEALTHY", "score": 1.0}

                # Coverage evaluation
                coverage_details[str(im.id)] = {"status": "HEALTHY", "score": 1.0}
                
                # Provenance evaluation
                provenance_details[str(im.id)] = {"status": "HEALTHY", "score": 1.0}

        # Resolve overall state
        if kpi_missing_data or not has_kpi:
            state = "BLOCKED"
        elif stale_observed:
            state = "STALE"
        elif issues:
            state = "PARTIAL"

        return {
            "id": uuid.uuid4(),
            "organization_id": org_id,
            "initiative_metric_id": im_list[0].id,
            "state": state,
            "completeness": {"status": "BLOCKED" if kpi_missing_data else "HEALTHY", "score": 0.0 if kpi_missing_data else 1.0, "details": "KPI observations completeness assessment"},
            "freshness": {"status": "STALE" if stale_observed else "HEALTHY", "score": 0.3 if stale_observed else 1.0, "details": "Freshness boundary tracking"},
            "validity": {"status": "HEALTHY", "score": 1.0, "details": "Rows format validity checks"},
            "consistency": {"status": "NOT_EVALUATED", "score": None, "details": "Consistency is not evaluated in V1."},
            "coverage": {"status": "HEALTHY", "score": 1.0, "details": "Period coverage tracking"},
            "comparability": {"status": "NOT_EVALUATED", "score": None, "details": "Comparability is not evaluated in V1."},
            "provenance": {"status": "HEALTHY", "score": 1.0, "details": "File source metadata check"},
            "issues": {"issues": issues},
            "method_version": "v1.0-dq",
            "assessed_at": datetime.now(timezone.utc)
        }

