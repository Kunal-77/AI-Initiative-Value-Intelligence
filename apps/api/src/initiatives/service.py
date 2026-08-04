import uuid
import datetime
from datetime import datetime as datetime_cls, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, text
from fastapi import HTTPException, status

from src.initiatives.models import Initiative, InitiativeVersion, Investment, InvestmentCostItem, Claim, Evidence, EvidenceStrengthAssessment, Intervention, Review, ReviewSnapshot, AIRun, Recommendation, Decision, DecisionExpectation, Outcome, Learning
from src.measurements.models import InitiativeMetric, Observation, SourceFile
from src.identity.authorization import AuthorizationContext

class InitiativesService:
    @staticmethod
    def create_initiative(db: Session, context: AuthorizationContext, name: str, business_area: Optional[str], problem_statement: Optional[str], proposed_intervention: Optional[str], expected_business_outcome: Optional[str], planned_start_date: Optional[datetime.date]) -> Initiative:
        """
        Creates a new initiative in DRAFT state.
        """
        initiative = Initiative(
            id=uuid.uuid4(),
            organization_id=context.active_organization_id,
            name=name,
            business_area=business_area,
            owner_user_id=context.user_id,
            lifecycle_state="DRAFT",
            problem_statement=problem_statement,
            proposed_intervention=proposed_intervention,
            expected_business_outcome=expected_business_outcome,
            planned_start_date=planned_start_date,
            created_by_user_id=context.user_id
        )
        db.add(initiative)
        
        # Auto-create Investment Draft Version 1
        investment = Investment(
            id=uuid.uuid4(),
            organization_id=context.active_organization_id,
            initiative_id=initiative.id,
            version_number=1,
            currency="USD",
            status="DRAFT",
            created_by_user_id=context.user_id
        )
        db.add(investment)
        
        db.commit()
        db.refresh(initiative)
        return initiative

    @staticmethod
    def get_initiative(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> Initiative:
        """
        Retrieves initiative, strictly scoped to organization.
        """
        stmt = select(Initiative).where(
            Initiative.organization_id == org_id,
            Initiative.id == initiative_id
        )
        initiative = db.scalars(stmt).first()
        if not initiative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Initiative not found."
            )
        return initiative

    @staticmethod
    def list_initiatives(db: Session, org_id: uuid.UUID) -> List[Initiative]:
        """
        Lists all initiatives for the organization.
        """
        stmt = select(Initiative).where(
            Initiative.organization_id == org_id,
            Initiative.archived_at.is_(None)
        ).order_by(Initiative.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def update_initiative(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, data: dict) -> Initiative:
        """
        Updates initiative properties.
        If active, triggers a version snapshot.
        """
        org_id = context.active_organization_id
        # Concurrency safety: acquire advisory lock on parent initiative
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        
        if initiative.lifecycle_state in ["COMPLETED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot edit initiative in terminal state: {initiative.lifecycle_state}."
            )
            
        # Snapshot trigger: if in ACTIVE state, snapshot before applying changes
        if initiative.lifecycle_state == "ACTIVE":
            InitiativesService.create_business_case_snapshot(db, context, initiative, "Pre-modification ACTIVE state snapshot")

        for key, val in data.items():
            if val is not None:
                setattr(initiative, key, val)
                
        db.commit()
        db.refresh(initiative)
        return initiative

    @staticmethod
    def archive_initiative(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> Initiative:
        """
        Soft-archives an initiative.
        """
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        initiative.archived_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(initiative)
        return initiative

    @staticmethod
    def create_business_case_snapshot(db: Session, context: AuthorizationContext, initiative: Initiative, change_reason: Optional[str] = None) -> InitiativeVersion:
        """
        Generates a business case version snapshot. Concurrency safe.
        """
        # Determine version number
        stmt = select(func.max(InitiativeVersion.version_number)).where(
            InitiativeVersion.initiative_id == initiative.id
        )
        max_ver = db.scalar(stmt)
        next_ver = 1 if max_ver is None else max_ver + 1
        
        snapshot = {
            "name": initiative.name,
            "business_area": initiative.business_area,
            "problem_statement": initiative.problem_statement,
            "proposed_intervention": initiative.proposed_intervention,
            "expected_business_outcome": initiative.expected_business_outcome,
            "planned_start_date": str(initiative.planned_start_date) if initiative.planned_start_date else None,
            "actual_start_date": str(initiative.actual_start_date) if initiative.actual_start_date else None,
        }
        
        version = InitiativeVersion(
            id=uuid.uuid4(),
            organization_id=initiative.organization_id,
            initiative_id=initiative.id,
            version_number=next_ver,
            business_case_snapshot=snapshot,
            change_reason=change_reason,
            created_by_user_id=context.user_id
        )
        db.add(version)
        db.flush() # flush to generate inside transaction
        return version

    @staticmethod
    def transition_lifecycle(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, target_state: str, change_reason: Optional[str] = None) -> Initiative:
        """
        Transitions lifecycle state with strict prerequisite checks.
        """
        org_id = context.active_organization_id
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        current = initiative.lifecycle_state
        
        # Strict Transition Map
        allowed_transitions = {
            "DRAFT": ["SUBMITTED", "ABANDONED"],
            "SUBMITTED": ["DRAFT", "ACTIVE", "ABANDONED"],
            "ACTIVE": ["COMPLETED", "ABANDONED"],
            "COMPLETED": [],
            "ABANDONED": []
        }
        
        if target_state not in allowed_transitions.get(current, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transition from {current} to {target_state} is invalid."
            )
            
        # Prerequisite validation for SUBMITTED state
        if target_state == "SUBMITTED":
            # 1. Must have exactly one PRIMARY_KPI
            kpi_count_stmt = select(func.count(InitiativeMetric.id)).where(
                InitiativeMetric.initiative_id == initiative_id,
                InitiativeMetric.role == "PRIMARY_KPI",
                InitiativeMetric.status != "SUPERSEDED"
            )
            kpi_count = db.scalar(kpi_count_stmt)
            if kpi_count != 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Initiative must have exactly one PRIMARY_KPI configured before submission."
                )
                
            # 2. Must have a cost plan version configured
            invest_stmt = select(func.count(Investment.id)).where(
                Investment.initiative_id == initiative_id
            )
            invest_count = db.scalar(invest_stmt)
            if invest_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Initiative must have an investment plan configured before submission."
                )
                
            # Snapshot the business case upon submission
            InitiativesService.create_business_case_snapshot(db, context, initiative, change_reason or "Initial Submission Snapshot")

        initiative.lifecycle_state = target_state
        db.commit()
        db.refresh(initiative)
        return initiative

    @staticmethod
    def get_latest_investment(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> Investment:
        """
        Retrieves the latest investment version for an initiative.
        """
        stmt = select(Investment).where(
            Investment.organization_id == org_id,
            Investment.initiative_id == initiative_id
        ).order_by(Investment.version_number.desc())
        invest = db.scalars(stmt).first()
        if not invest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Investment plan not found."
            )
        return invest

    @staticmethod
    def add_cost_item(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, category: str, value_type: str, amount: float, currency: str, recurrence: str, source_reference: Optional[str] = None, assumption_note: Optional[str] = None) -> InvestmentCostItem:
        """
        Adds a cost item to the current investment plan.
        If current plan is APPROVED, automatically creates a new DRAFT version, copying over items.
        """
        org_id = context.active_organization_id
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:init_id))"), {"init_id": str(initiative_id)})
        
        # Verify initiative exists
        initiative = InitiativesService.get_initiative(db, org_id, initiative_id)
        if initiative.lifecycle_state in ["COMPLETED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot edit initiative in terminal state: {initiative.lifecycle_state}."
            )
        
        current_invest = InitiativesService.get_latest_investment(db, org_id, initiative_id)
        
        # Auto-versioning if current is approved
        if current_invest.status == "APPROVED":
            next_ver = current_invest.version_number + 1
            new_invest = Investment(
                id=uuid.uuid4(),
                organization_id=org_id,
                initiative_id=initiative_id,
                version_number=next_ver,
                currency=currency,
                status="DRAFT",
                created_by_user_id=context.user_id
            )
            db.add(new_invest)
            db.flush()
            
            # Copy items from old investment to new DRAFT
            for old_item in current_invest.cost_items:
                new_item = InvestmentCostItem(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    investment_id=new_invest.id,
                    category=old_item.category,
                    value_type=old_item.value_type,
                    amount=old_item.amount,
                    currency=currency, # Convert/assign to the new plan's currency
                    recurrence=old_item.recurrence,
                    source_reference=old_item.source_reference,
                    assumption_note=old_item.assumption_note
                )
                db.add(new_item)
            
            current_invest = new_invest
        
        # Enforce same currency constraint
        if current_invest.currency != currency:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cost item currency ({currency}) must match parent investment plan currency ({current_invest.currency})."
            )
            
        cost_item = InvestmentCostItem(
            id=uuid.uuid4(),
            organization_id=org_id,
            investment_id=current_invest.id,
            category=category,
            value_type=value_type,
            amount=amount,
            currency=currency,
            recurrence=recurrence,
            source_reference=source_reference,
            assumption_note=assumption_note
        )
        db.add(cost_item)
        db.commit()
        db.refresh(cost_item)
        return cost_item

    @staticmethod
    def derive_investment_totals(db: Session, investment_id: uuid.UUID) -> dict:
        """
        Derives planned vs actual totals directly from cost items using SUM SQL aggregates.
        """
        stmt = select(
            InvestmentCostItem.value_type,
            func.sum(InvestmentCostItem.amount)
        ).where(
            InvestmentCostItem.investment_id == investment_id
        ).group_by(InvestmentCostItem.value_type)
        
        results = db.execute(stmt).all()
        totals = {"PLANNED": 0.00, "ACTUAL": 0.00, "MODELED": 0.00}
        for row in results:
            totals[row[0]] = float(row[1]) if row[1] is not None else 0.00
        return totals


class ReviewsAndEvidenceService:
    @staticmethod
    def create_intervention(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, action_type: str, title: str, description: Optional[str], reason: Optional[str], effective_at: datetime_cls) -> Intervention:
        org_id = context.active_organization_id
        # Verify initiative exists
        InitiativesService.get_initiative(db, org_id, initiative_id)
        
        intervention = Intervention(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=initiative_id,
            action_type=action_type,
            title=title,
            description=description,
            reason=reason,
            effective_at=effective_at,
            created_by_user_id=context.user_id
        )
        db.add(intervention)
        db.commit()
        db.refresh(intervention)
        return intervention

    @staticmethod
    def list_interventions(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> List[Intervention]:
        stmt = select(Intervention).where(
            Intervention.organization_id == org_id,
            Intervention.initiative_id == initiative_id
        ).order_by(Intervention.effective_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_claim(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, claim_type: str, statement: str) -> Claim:
        org_id = context.active_organization_id
        # Verify initiative exists
        InitiativesService.get_initiative(db, org_id, initiative_id)
        
        claim = Claim(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=initiative_id,
            claim_type=claim_type,
            statement=statement,
            status="DRAFT",
            created_by_user_id=context.user_id
        )
        db.add(claim)
        db.commit()
        db.refresh(claim)
        return claim

    @staticmethod
    def get_claim(db: Session, org_id: uuid.UUID, claim_id: uuid.UUID) -> Claim:
        stmt = select(Claim).where(
            Claim.organization_id == org_id,
            Claim.id == claim_id
        )
        claim = db.scalars(stmt).first()
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found.")
        return claim

    @staticmethod
    def list_claims(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> List[Claim]:
        stmt = select(Claim).where(
            Claim.organization_id == org_id,
            Claim.initiative_id == initiative_id
        ).order_by(Claim.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_evidence(db: Session, context: AuthorizationContext, claim_id: uuid.UUID, evidence_level: str, stance: str, source_type: str, observation_id: Optional[uuid.UUID], source_file_id: Optional[uuid.UUID], source_reference: Optional[str], method: Optional[str], scope: Optional[dict], period_start: Optional[datetime_cls], period_end: Optional[datetime_cls], assumptions: Optional[dict], limitations: Optional[dict]) -> Evidence:
        org_id = context.active_organization_id
        
        # Enforce source invariant at the service level (redundant check to match check constraint)
        if source_type == "OBSERVATION" and (not observation_id or source_file_id):
            raise HTTPException(status_code=422, detail="Observation evidence requires observation_id and no source_file_id.")
        if source_type == "FILE" and (not source_file_id or observation_id):
            raise HTTPException(status_code=422, detail="File evidence requires source_file_id and no observation_id.")
        if source_type not in ["OBSERVATION", "FILE"] and (observation_id or source_file_id):
            raise HTTPException(status_code=422, detail="Non-data evidence cannot have observation_id or source_file_id.")

        claim = ReviewsAndEvidenceService.get_claim(db, org_id, claim_id)
        
        # Verify observation and file exist and belong to the org if provided
        if observation_id:
            stmt = select(Observation).where(Observation.organization_id == org_id, Observation.id == observation_id)
            if not db.scalars(stmt).first():
                raise HTTPException(status_code=404, detail="Observation not found.")
        if source_file_id:
            stmt = select(SourceFile).where(SourceFile.organization_id == org_id, SourceFile.id == source_file_id)
            if not db.scalars(stmt).first():
                raise HTTPException(status_code=404, detail="Source file not found.")

        evidence = Evidence(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=claim.initiative_id,
            claim_id=claim_id,
            evidence_level=evidence_level,
            stance=stance,
            source_type=source_type,
            observation_id=observation_id,
            source_file_id=source_file_id,
            source_reference=source_reference,
            method=method,
            scope=scope,
            period_start=period_start,
            period_end=period_end,
            assumptions=assumptions,
            limitations=limitations,
            validation_state="UNVALIDATED",
            created_by_user_id=context.user_id
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def get_evidence(db: Session, org_id: uuid.UUID, evidence_id: uuid.UUID) -> Evidence:
        stmt = select(Evidence).where(
            Evidence.organization_id == org_id,
            Evidence.id == evidence_id
        )
        evidence = db.scalars(stmt).first()
        if not evidence:
            raise HTTPException(status_code=404, detail="Evidence not found.")
        return evidence

    @staticmethod
    def list_evidence(db: Session, org_id: uuid.UUID, claim_id: uuid.UUID) -> List[Evidence]:
        stmt = select(Evidence).where(
            Evidence.organization_id == org_id,
            Evidence.claim_id == claim_id
        ).order_by(Evidence.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def validate_evidence(db: Session, context: AuthorizationContext, evidence_id: uuid.UUID) -> Evidence:
        org_id = context.active_organization_id
        evidence = ReviewsAndEvidenceService.get_evidence(db, org_id, evidence_id)
        
        if evidence.validation_state in ["VALIDATED", "REJECTED"]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Evidence validation state is terminal and immutable.")
            
        evidence.validation_state = "VALIDATED"
        evidence.validated_by_user_id = context.user_id
        evidence.validated_at = datetime_cls.now(timezone.utc)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def reject_evidence(db: Session, context: AuthorizationContext, evidence_id: uuid.UUID, reason: str) -> Evidence:
        if not reason or not reason.strip():
            raise HTTPException(status_code=422, detail="Rejection reason is required.")
            
        org_id = context.active_organization_id
        evidence = ReviewsAndEvidenceService.get_evidence(db, org_id, evidence_id)
        
        if evidence.validation_state in ["VALIDATED", "REJECTED"]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Evidence validation state is terminal and immutable.")
            
        evidence.validation_state = "REJECTED"
        evidence.rejection_reason = reason
        evidence.validated_by_user_id = context.user_id
        evidence.validated_at = datetime_cls.now(timezone.utc)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def get_claim_strength(db: Session, org_id: uuid.UUID, claim_id: uuid.UUID) -> dict:
        from src.measurements.service import MeasurementsService
        claim = ReviewsAndEvidenceService.get_claim(db, org_id, claim_id)
        
        # Query all validated evidence for this claim
        stmt = select(Evidence).where(
            Evidence.organization_id == org_id,
            Evidence.claim_id == claim_id,
            Evidence.validation_state == "VALIDATED"
        )
        evidence_list = db.scalars(stmt).all()
        
        # 1. Conflicting evidence check
        has_conflicts = any(ev.stance == "CONFLICTS" for ev in evidence_list)
        if has_conflicts or not evidence_list:
            return {
                "state": "LIMITED",
                "factors": {"reason": "Conflicting or missing validated supporting evidence."},
                "confounders": {}
            }
            
        # Get data quality status for initiative target metrics
        dq = MeasurementsService.get_data_quality_summary(db, org_id, claim.initiative_id)
        is_healthy = dq.get("state") == "HEALTHY"
        
        # Get highest evidence level
        supporting = [ev for ev in evidence_list if ev.stance == "SUPPORTS"]
        if not supporting:
            return {
                "state": "LIMITED",
                "factors": {"reason": "No validated supporting evidence found."},
                "confounders": {}
            }
            
        highest_level = max(ev.evidence_level for ev in supporting)
        
        # 2. Check for interventions (as confounders marker on timeline)
        interventions = ReviewsAndEvidenceService.list_interventions(db, org_id, claim.initiative_id)
        has_interventions = len(interventions) > 0
        
        # Rules:
        if highest_level in ["E0", "E1"] or not is_healthy:
            state = "LIMITED"
            reason = "Supporting evidence is unverified/raw, or target data quality is unhealthy."
        elif highest_level in ["E2", "E3"]:
            state = "MODERATE"
            reason = "Supporting evidence contains derived/observed changes, with healthy data quality."
        else: # E4, E5, E6
            if has_interventions:
                state = "STRONG"
                reason = "High-level supporting evidence present, data quality is healthy, and concurrent interventions are documented."
            else:
                state = "MODERATE"
                reason = "High-level supporting evidence present, but downgraded to MODERATE because no concurrent interventions are logged to track confounders."
                
        return {
            "state": state,
            "factors": {"reason": reason, "highest_level": highest_level, "data_quality_healthy": is_healthy},
            "confounders": {"interventions_logged": len(interventions)}
        }

    @staticmethod
    def create_review(db: Session, context: AuthorizationContext, initiative_id: uuid.UUID, review_type: str, scheduled_at: Optional[datetime_cls], decision_question: Optional[str]) -> Review:
        org_id = context.active_organization_id
        # Verify initiative exists
        InitiativesService.get_initiative(db, org_id, initiative_id)
        
        review = Review(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=initiative_id,
            review_type=review_type,
            status="DRAFT",
            scheduled_at=scheduled_at,
            decision_question=decision_question
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def get_review(db: Session, org_id: uuid.UUID, review_id: uuid.UUID) -> Review:
        stmt = select(Review).where(
            Review.organization_id == org_id,
            Review.id == review_id
        )
        review = db.scalars(stmt).first()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found.")
        return review

    @staticmethod
    def list_reviews(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> List[Review]:
        stmt = select(Review).where(
            Review.organization_id == org_id,
            Review.initiative_id == initiative_id
        ).order_by(Review.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_review_readiness(db: Session, org_id: uuid.UUID, review_id: uuid.UUID) -> dict:
        from src.measurements.service import MeasurementsService
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        blockers = []
        
        # 1. Primary KPI check
        stmt = select(InitiativeMetric).where(
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.initiative_id == review.initiative_id
        )
        metrics = db.scalars(stmt).all()
        kpis = [m for m in metrics if m.role == "PRIMARY_KPI"]
        if not kpis:
            blockers.append("Initiative has no Primary KPI assigned.")
        else:
            # 2. Check baseline and targets for Primary KPI
            for kpi in kpis:
                # Check target values
                if kpi.target_value is None and kpi.target_lower is None and kpi.target_upper is None:
                    blockers.append(f"Primary KPI '{kpi.id}' has no target values defined.")
                # Check baseline (approved)
                from src.measurements.models import Baseline
                baseline_stmt = select(Baseline).where(
                    Baseline.organization_id == org_id,
                    Baseline.initiative_metric_id == kpi.id,
                    Baseline.status == "APPROVED"
                )
                if not db.scalars(baseline_stmt).first():
                    blockers.append(f"Primary KPI '{kpi.id}' has no approved baseline defined.")
                    
        # 3. Unvalidated evidence check
        stmt = select(Evidence).where(
            Evidence.organization_id == org_id,
            Evidence.initiative_id == review.initiative_id,
            Evidence.validation_state == "UNVALIDATED"
        )
        if db.scalars(stmt).first():
            blockers.append("Unvalidated evidence is attached to active claims.")
            
        # 4. Data quality blocker check
        dq = MeasurementsService.get_data_quality_summary(db, org_id, review.initiative_id)
        if dq.get("state") in ["BLOCKED", "STALE"]:
            blockers.append("Data quality state of target metrics is BLOCKED or STALE.")
            
        # 5. Currency conflict check
        try:
            # Running analytics summary checks currency mismatch
            MeasurementsService.get_analytics_summary(db, org_id, review.initiative_id)
        except HTTPException as e:
            if e.status_code == 400 and "currency" in str(e.detail).lower():
                blockers.append("Mismatched currencies found without a defined exchange conversion.")
                
        # Also check investments currencies vs metric currencies
        # (This is handled by get_analytics_summary above)

        return {
            "ready": len(blockers) == 0,
            "blockers": blockers,
            "review": review
        }

    @staticmethod
    def prepare_review(db: Session, context: AuthorizationContext, review_id: uuid.UUID) -> Review:
        org_id = context.active_organization_id
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        
        if review.status in ["COMPLETED", "CANCELLED"]:
            raise HTTPException(status_code=409, detail=f"Cannot prepare review in status: {review.status}.")
            
        readiness = ReviewsAndEvidenceService.get_review_readiness(db, org_id, review_id)
        review.status = "READY" if readiness["ready"] else "DRAFT"
        review.updated_at = datetime_cls.now(timezone.utc)
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def freeze_review(db: Session, context: AuthorizationContext, review_id: uuid.UUID) -> ReviewSnapshot:
        from src.measurements.service import MeasurementsService
        org_id = context.active_organization_id
        
        # 1. Acquire transaction-level advisory lock on review_id for safe concurrency versioning
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:review_id))"), {"review_id": str(review_id)})
        
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        if review.status not in ["DRAFT", "READY"]:
            raise HTTPException(status_code=409, detail=f"Review cannot be frozen in status: {review.status}.")
            
        readiness = ReviewsAndEvidenceService.get_review_readiness(db, org_id, review_id)
        if not readiness["ready"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot freeze review with active blockers: {', '.join(readiness['blockers'])}"
            )
            
        # Determine next snapshot version
        stmt = select(func.coalesce(func.max(ReviewSnapshot.snapshot_version), 0)).where(
            ReviewSnapshot.organization_id == org_id,
            ReviewSnapshot.review_id == review_id
        )
        next_version = db.execute(stmt).scalar() + 1
        
        # Gather Snapshots
        # A. Initiative business case snapshot
        stmt = select(InitiativeVersion).where(
            InitiativeVersion.organization_id == org_id,
            InitiativeVersion.initiative_id == review.initiative_id
        ).order_by(InitiativeVersion.version_number.desc())
        latest_version = db.scalars(stmt).first()
        if not latest_version:
            # Create a default business case version snapshot if none exists
            latest_version = InitiativesService.create_business_case_snapshot(db, context, review.initiative, "Auto snapshot at review freeze")
            
        # B. Investment
        stmt = select(Investment).where(
            Investment.organization_id == org_id,
            Investment.initiative_id == review.initiative_id
        ).order_by(Investment.version_number.desc())
        latest_investment = db.scalars(stmt).first()
        investment_id = latest_investment.id if latest_investment else None
        
        # C. Measurement & Data Quality snapshots
        measurement_snapshot = MeasurementsService.get_analytics_summary(db, org_id, review.initiative_id)
        data_quality_snapshot = MeasurementsService.get_data_quality_summary(db, org_id, review.initiative_id)
        
        def make_json_serializable(val):
            if isinstance(val, dict):
                return {k: make_json_serializable(v) for k, v in val.items()}
            elif isinstance(val, list):
                return [make_json_serializable(v) for v in val]
            elif isinstance(val, uuid.UUID):
                return str(val)
            elif hasattr(val, "isoformat"):
                return val.isoformat()
            return val

        measurement_snapshot = make_json_serializable(measurement_snapshot)
        data_quality_snapshot = make_json_serializable(data_quality_snapshot)
        
        # D. Evidence & Claims snapshots
        claims_stmt = select(Claim).where(Claim.organization_id == org_id, Claim.initiative_id == review.initiative_id)
        claims = db.scalars(claims_stmt).all()
        evidence_snapshot_data = []
        assumptions_snapshot_data = []
        
        for c in claims:
            strength = ReviewsAndEvidenceService.get_claim_strength(db, org_id, c.id)
            c_data = {
                "id": str(c.id),
                "claim_type": c.claim_type,
                "statement": c.statement,
                "status": c.status,
                "strength": strength,
                "evidence": []
            }
            ev_stmt = select(Evidence).where(Evidence.organization_id == org_id, Evidence.claim_id == c.id, Evidence.validation_state == "VALIDATED")
            evidence_items = db.scalars(ev_stmt).all()
            for ev in evidence_items:
                c_data["evidence"].append({
                    "id": str(ev.id),
                    "evidence_level": ev.evidence_level,
                    "stance": ev.stance,
                    "source_type": ev.source_type,
                    "observation_id": str(ev.observation_id) if ev.observation_id else None,
                    "source_file_id": str(ev.source_file_id) if ev.source_file_id else None,
                    "period_start": ev.period_start.isoformat() if ev.period_start else None,
                    "period_end": ev.period_end.isoformat() if ev.period_end else None
                })
                if ev.assumptions:
                    assumptions_snapshot_data.append({"type": "evidence", "id": str(ev.id), "assumptions": ev.assumptions})
                if ev.limitations:
                    assumptions_snapshot_data.append({"type": "evidence_limitation", "id": str(ev.id), "limitations": ev.limitations})
            evidence_snapshot_data.append(c_data)
            
        if latest_investment and latest_investment.assumptions:
            assumptions_snapshot_data.append({"type": "investment", "id": str(investment_id), "assumptions": latest_investment.assumptions})
            
        snapshot = ReviewSnapshot(
            id=uuid.uuid4(),
            organization_id=org_id,
            review_id=review_id,
            initiative_id=review.initiative_id,
            snapshot_version=next_version,
            initiative_version_id=latest_version.id,
            investment_id=investment_id,
            measurement_snapshot=measurement_snapshot,
            data_quality_snapshot=data_quality_snapshot,
            evidence_snapshot={"claims": evidence_snapshot_data},
            assumptions_snapshot={"assumptions": assumptions_snapshot_data},
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(snapshot)
        
        # Advance review status to IN_REVIEW
        review.status = "IN_REVIEW"
        review.updated_at = datetime_cls.now(timezone.utc)
        db.commit()
        db.refresh(snapshot)
        return snapshot

    @staticmethod
    def complete_review(db: Session, context: AuthorizationContext, review_id: uuid.UUID) -> Review:
        org_id = context.active_organization_id
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        
        if review.status != "IN_REVIEW":
            raise HTTPException(status_code=409, detail=f"Only reviews in IN_REVIEW status can be completed.")
            
        review.status = "COMPLETED"
        review.updated_at = datetime_cls.now(timezone.utc)
        db.commit()
        db.refresh(review)
        return review


class RecommendationsAndDecisionsService:
    @staticmethod
    def generate_recommendation(db: Session, context: AuthorizationContext, review_id: uuid.UUID) -> Recommendation:
        org_id = context.active_organization_id
        
        # Advisory lock for safe versioning
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:review_id))"), {"review_id": str(review_id)})
        
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        
        # Get latest snapshot
        snapshot_stmt = select(ReviewSnapshot).where(
            ReviewSnapshot.organization_id == org_id,
            ReviewSnapshot.review_id == review_id
        ).order_by(ReviewSnapshot.snapshot_version.desc())
        snapshot = db.scalars(snapshot_stmt).first()
        
        if not snapshot:
            raise HTTPException(status_code=404, detail="Frozen review snapshot not found. Freeze review first.")
            
        # Check idempotency
        existing_stmt = select(Recommendation).where(
            Recommendation.organization_id == org_id,
            Recommendation.review_snapshot_id == snapshot.id,
            Recommendation.policy_version == "V1"
        )
        existing = db.scalars(existing_stmt).first()
        if existing:
            return existing
            
        # Deterministic Policy Matrix Calculation
        # A. Target Attainment
        meas_snap = snapshot.measurement_snapshot
        kpis = meas_snap.get("kpis", [])
        primary_kpis = [k for k in kpis if k.get("role") == "PRIMARY_KPI"]
        if not primary_kpis:
            target_attained = False
        else:
            target_attained = all(k.get("target_attained", False) for k in primary_kpis)
            
        # B. Guardrails
        guardrails = meas_snap.get("guardrails", [])
        guardrails_all_passing = all(not g.get("breached", False) for g in guardrails)
        
        # C. Data Quality State
        dq_snap = snapshot.data_quality_snapshot
        data_quality_state = dq_snap.get("state", "HEALTHY")
        
        # D. Evidence Strength
        ev_snap = snapshot.evidence_snapshot
        claims_list = ev_snap.get("claims", [])
        if not claims_list:
            evidence_strength = "LIMITED"
        else:
            strengths = set()
            for c in claims_list:
                str_obj = c.get("strength")
                if isinstance(str_obj, dict):
                    strengths.add(str_obj.get("state", "LIMITED"))
                elif isinstance(str_obj, str):
                    strengths.add(str_obj)
            if "LIMITED" in strengths or not strengths:
                evidence_strength = "LIMITED"
            elif "MODERATE" in strengths:
                evidence_strength = "MODERATE"
            else:
                evidence_strength = "STRONG"
                
        # Resolve Policy Recommendation Type and Support State
        recommendation_type = "CONTINUE_MEASUREMENT"
        support_state = "INSUFFICIENT"
        rationale = "Insufficient evidence or data quality blocker."
        conditions = {}
        
        if data_quality_state == "BLOCKED":
            recommendation_type = "CONTINUE_MEASUREMENT"
            support_state = "INSUFFICIENT"
            rationale = "Measurement is currently blocked due to missing KPI definitions or lack of initial observations."
        elif data_quality_state in ["PARTIAL", "STALE"]:
            recommendation_type = "CONTINUE_MEASUREMENT"
            support_state = "INSUFFICIENT"
            rationale = "Data quality issues or stale observations (exceeding 60 days) detected. Recommend continuing measurement and refreshing sources."
        else:
            # Data Quality is HEALTHY
            if target_attained:
                if guardrails_all_passing:
                    if evidence_strength == "STRONG":
                        recommendation_type = "SCALE"
                        support_state = "SUPPORTED"
                        rationale = "Primary KPI targets successfully met, all guardrails passing, and supported by STRONG validated evidence."
                    elif evidence_strength == "MODERATE":
                        recommendation_type = "KEEP"
                        support_state = "SUPPORTED_WITH_CONDITIONS"
                        rationale = "Primary KPI targets met with MODERATE evidence strength. Recommend keeping the current state subject to regular monitoring."
                        conditions = {"monitoring_frequency": "WEEKLY"}
                    else: # LIMITED
                        recommendation_type = "CONTINUE_MEASUREMENT"
                        support_state = "INSUFFICIENT"
                        rationale = "Primary KPI targets met, but evidence strength is LIMITED. Recommend continuing measurement to build statistical confidence."
                else:
                    # Guardrail breached
                    if evidence_strength == "STRONG":
                        recommendation_type = "OPTIMIZE"
                        support_state = "SUPPORTED_WITH_CONDITIONS"
                        rationale = "Primary KPI targets met with STRONG evidence, but one or more guardrails breached. Recommend optimizing resource efficiency to address breaches."
                        conditions = {"remediation_target": "GUARDRAIL_STABILITY"}
                    else:
                        recommendation_type = "CONTINUE_MEASUREMENT"
                        support_state = "INSUFFICIENT"
                        rationale = "Primary KPI targets met, but guardrails breached and evidence is inadequate. Recommend continuing measurement with closer control."
            else:
                # Target not met
                if evidence_strength == "STRONG":
                    recommendation_type = "STOP"
                    support_state = "SUPPORTED"
                    rationale = "Primary KPI targets not met despite STRONG validated evidence and concurrent timeline interventions. Recommend stopping the initiative."
                elif evidence_strength == "MODERATE":
                    recommendation_type = "OPTIMIZE"
                    support_state = "SUPPORTED_WITH_CONDITIONS"
                    rationale = "Primary KPI targets not met under MODERATE evidence strength. Recommend optimizing proposed interventions."
                    conditions = {"optimization_review": "PROCESS_CHANGE"}
                else:
                    recommendation_type = "CONTINUE_MEASUREMENT"
                    support_state = "INSUFFICIENT"
                    rationale = "Primary KPI targets not met and evidence is LIMITED. Recommend continuing measurement."
                    
        # Version number increment
        version_stmt = select(func.coalesce(func.max(Recommendation.version_number), 0)).where(
            Recommendation.organization_id == org_id,
            Recommendation.review_snapshot_id == snapshot.id
        )
        next_ver = db.execute(version_stmt).scalar() + 1
        
        rec = Recommendation(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=review.initiative_id,
            review_snapshot_id=snapshot.id,
            version_number=next_ver,
            recommendation_type=recommendation_type,
            support_state=support_state,
            rationale=rationale,
            conditions=conditions,
            policy_version="V1",
            ai_contributed=False,
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec

    @staticmethod
    def list_recommendations(db: Session, org_id: uuid.UUID, review_id: uuid.UUID) -> List[Recommendation]:
        stmt = select(Recommendation).where(
            Recommendation.organization_id == org_id,
            Recommendation.initiative_id == select(Review.initiative_id).where(Review.id == review_id).scalar_subquery()
        ).order_by(Recommendation.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_recommendation(db: Session, org_id: uuid.UUID, id: uuid.UUID) -> Recommendation:
        stmt = select(Recommendation).where(Recommendation.id == id, Recommendation.organization_id == org_id)
        rec = db.scalars(stmt).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Recommendation not found.")
        return rec

    @staticmethod
    def record_decision(db: Session, context: AuthorizationContext, review_id: uuid.UUID, data) -> Decision:
        org_id = context.active_organization_id
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        
        # Verify recommendation_id if provided
        recommendation_id = data.recommendation_id
        if recommendation_id:
            stmt = select(Recommendation).where(
                Recommendation.id == recommendation_id,
                Recommendation.organization_id == org_id,
                Recommendation.initiative_id == review.initiative_id
            )
            rec = db.scalars(stmt).first()
            if not rec:
                raise HTTPException(status_code=400, detail="Provided recommendation does not belong to this initiative/review.")
                
        decision = Decision(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=review.initiative_id,
            review_id=review_id,
            recommendation_id=recommendation_id,
            decision_type=data.decision_type,
            decision_source=data.decision_source,
            rationale=data.rationale,
            conditions=data.conditions,
            decided_by_user_id=context.user_id,
            decided_at=datetime_cls.now(timezone.utc),
            external_reference=data.external_reference,
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)
        return decision

    @staticmethod
    def get_decision(db: Session, org_id: uuid.UUID, id: uuid.UUID) -> Decision:
        stmt = select(Decision).where(Decision.id == id, Decision.organization_id == org_id)
        dec = db.scalars(stmt).first()
        if not dec:
            raise HTTPException(status_code=404, detail="Decision not found.")
        return dec

    @staticmethod
    def list_initiative_decisions(db: Session, org_id: uuid.UUID, initiative_id: uuid.UUID) -> List[Decision]:
        stmt = select(Decision).where(Decision.organization_id == org_id, Decision.initiative_id == initiative_id).order_by(Decision.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_expectation(db: Session, context: AuthorizationContext, decision_id: uuid.UUID, data) -> DecisionExpectation:
        org_id = context.active_organization_id
        decision = RecommendationsAndDecisionsService.get_decision(db, org_id, decision_id)
        
        if data.period_end <= data.period_start:
            raise HTTPException(status_code=400, detail="period_end must be strictly after period_start.")
            
        if data.expected_value is None and data.expected_change is None:
            raise HTTPException(status_code=400, detail="Must provide at least expected_value or expected_change.")
            
        # Metric validation
        metric_stmt = select(InitiativeMetric).where(
            InitiativeMetric.id == data.initiative_metric_id,
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.initiative_id == decision.initiative_id
        )
        metric = db.scalars(metric_stmt).first()
        if not metric:
            raise HTTPException(status_code=400, detail="Assigned metric not found for this decision's initiative.")
            
        from src.measurements.models import Baseline
        base_stmt = select(Baseline).where(Baseline.initiative_metric_id == metric.id, Baseline.status == "APPROVED")
        baseline = db.scalars(base_stmt).first()
        
        expected_value = data.expected_value
        expected_change = data.expected_change
        
        if baseline:
            val_base = float(baseline.value)
            if expected_value is not None and expected_change is not None:
                derived_val = val_base + float(expected_change)
                if abs(float(expected_value) - derived_val) >= 0.0001:
                    raise HTTPException(status_code=422, detail="expected_value and expected_change are mathematically inconsistent with baseline.")
            elif expected_change is not None:
                expected_value = val_base + float(expected_change)
            elif expected_value is not None:
                expected_change = float(expected_value) - val_base
        else:
            if expected_change is not None:
                raise HTTPException(status_code=400, detail="Cannot specify expected_change without an approved baseline.")
                
        expectation = DecisionExpectation(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=decision.initiative_id,
            decision_id=decision_id,
            initiative_metric_id=metric.id,
            expected_value=expected_value,
            expected_change=expected_change,
            period_start=data.period_start,
            period_end=data.period_end,
            assumptions=data.assumptions,
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(expectation)
        db.commit()
        db.refresh(expectation)
        return expectation

    @staticmethod
    def list_expectations(db: Session, org_id: uuid.UUID, decision_id: uuid.UUID) -> List[DecisionExpectation]:
        stmt = select(DecisionExpectation).where(DecisionExpectation.organization_id == org_id, DecisionExpectation.decision_id == decision_id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_outcome(db: Session, context: AuthorizationContext, decision_id: uuid.UUID, data) -> Outcome:
        org_id = context.active_organization_id
        decision = RecommendationsAndDecisionsService.get_decision(db, org_id, decision_id)
        
        # Verify metric
        metric_stmt = select(InitiativeMetric).where(
            InitiativeMetric.id == data.initiative_metric_id,
            InitiativeMetric.organization_id == org_id,
            InitiativeMetric.initiative_id == decision.initiative_id
        )
        metric = db.scalars(metric_stmt).first()
        if not metric:
            raise HTTPException(status_code=400, detail="Assigned metric not found for this decision's initiative.")
            
        # Verify observation is validated
        obs_stmt = select(Observation).where(
            Observation.id == data.observation_id,
            Observation.organization_id == org_id,
            Observation.initiative_id == decision.initiative_id,
            Observation.validation_state == "VALIDATED"
        )
        observation = db.scalars(obs_stmt).first()
        if not observation:
            raise HTTPException(status_code=400, detail="Observation must be VALIDATED and belong to the initiative.")
            
        # Get expectation
        exp_stmt = select(DecisionExpectation).where(
            DecisionExpectation.decision_id == decision_id,
            DecisionExpectation.initiative_metric_id == metric.id
        )
        expectation = db.scalars(exp_stmt).first()
        
        variance = None
        if expectation:
            # Check period compatibility
            if observation.period_start >= expectation.period_start and observation.period_end <= expectation.period_end:
                variance = float(observation.value) - float(expectation.expected_value)
                
        outcome = Outcome(
            id=uuid.uuid4(),
            organization_id=org_id,
            initiative_id=decision.initiative_id,
            decision_id=decision_id,
            initiative_metric_id=metric.id,
            observation_id=observation.id,
            variance_from_expected=variance,
            validation_state="UNVALIDATED",
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(outcome)
        db.commit()
        db.refresh(outcome)
        return outcome

    @staticmethod
    def get_outcome(db: Session, org_id: uuid.UUID, id: uuid.UUID) -> Outcome:
        stmt = select(Outcome).where(Outcome.id == id, Outcome.organization_id == org_id)
        outcome = db.scalars(stmt).first()
        if not outcome:
            raise HTTPException(status_code=404, detail="Outcome not found.")
        return outcome

    @staticmethod
    def list_decision_outcomes(db: Session, org_id: uuid.UUID, decision_id: uuid.UUID) -> List[Outcome]:
        stmt = select(Outcome).where(Outcome.organization_id == org_id, Outcome.decision_id == decision_id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def validate_outcome(db: Session, context: AuthorizationContext, outcome_id: uuid.UUID) -> Outcome:
        org_id = context.active_organization_id
        outcome = RecommendationsAndDecisionsService.get_outcome(db, org_id, outcome_id)
        
        if outcome.validation_state != "UNVALIDATED":
            raise HTTPException(status_code=409, detail="Outcome is in a terminal validation state.")
            
        outcome.validation_state = "VALIDATED"
        outcome.validated_by_user_id = context.user_id
        outcome.validated_at = datetime_cls.now(timezone.utc)
        db.commit()
        db.refresh(outcome)
        return outcome

    @staticmethod
    def dispute_outcome(db: Session, context: AuthorizationContext, outcome_id: uuid.UUID, reason: str) -> Outcome:
        org_id = context.active_organization_id
        outcome = RecommendationsAndDecisionsService.get_outcome(db, org_id, outcome_id)
        
        if outcome.validation_state != "UNVALIDATED":
            raise HTTPException(status_code=409, detail="Outcome is in a terminal validation state.")
            
        if not reason or not reason.strip():
            raise HTTPException(status_code=400, detail="Dispute reason is required.")
            
        outcome.validation_state = "DISPUTED"
        outcome.rejection_reason = reason
        db.commit()
        db.refresh(outcome)
        return outcome


class ModelProviderAdapter:
    def generate_completion(self, prompt: str, task_type: str, org_id: uuid.UUID, user_id: uuid.UUID) -> str:
        raise NotImplementedError()


class MockModelProviderAdapter(ModelProviderAdapter):
    def generate_completion(self, prompt: str, task_type: str, org_id: uuid.UUID, user_id: uuid.UUID) -> str:
        if task_type == "DRAFT_SUMMARY":
            return "Mocked narrative: Initiative met its Primary KPI target. Evidence strength is strong, supported by E6 validated observations."
        elif task_type == "INVESTIGATE":
            return "Mocked questions:\n- What was the impact of process change?\n- Were there other concurrent activities?"
        elif task_type == "EXPLAIN_RECOMMENDATION":
            return "Mocked explanation: The SCALE recommendation is driven by 100% KPI target attainment, healthy data quality, and Strong evidence."
        return "Mocked AI output"


class GroundedAIService:
    provider_adapter: ModelProviderAdapter = MockModelProviderAdapter()

    @classmethod
    def draft_review_summary(cls, db: Session, context: AuthorizationContext, review_id: uuid.UUID) -> dict:
        org_id = context.active_organization_id
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        
        snapshot_stmt = select(ReviewSnapshot).where(
            ReviewSnapshot.organization_id == org_id,
            ReviewSnapshot.review_id == review_id
        ).order_by(ReviewSnapshot.snapshot_version.desc())
        snapshot = db.scalars(snapshot_stmt).first()
        
        if not snapshot:
            raise HTTPException(status_code=404, detail="Snapshot not found for review. Freeze review first.")
            
        prompt = f"System prompt: Ground yourself in the snapshot data: {snapshot.evidence_snapshot}. Draft review narrative."
        
        ai_run = AIRun(
            id=uuid.uuid4(),
            organization_id=org_id,
            task_type="DRAFT_SUMMARY",
            prompt_template_version="v1",
            model_provider="mock",
            model_name="mock-model",
            token_count_input=100,
            token_count_output=50,
            latency_ms=10,
            created_by_user_id=context.user_id,
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(ai_run)
        db.commit()
        
        try:
            draft_text = cls.provider_adapter.generate_completion(prompt, "DRAFT_SUMMARY", org_id, context.user_id)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")
        
        return {
            "draft_text": draft_text,
            "source_references": [f"snapshot_version_{snapshot.snapshot_version}"],
            "ai_run_id": ai_run.id
        }

    @classmethod
    def suggest_investigations(cls, db: Session, context: AuthorizationContext, review_id: uuid.UUID) -> dict:
        org_id = context.active_organization_id
        review = ReviewsAndEvidenceService.get_review(db, org_id, review_id)
        
        snapshot_stmt = select(ReviewSnapshot).where(
            ReviewSnapshot.organization_id == org_id,
            ReviewSnapshot.review_id == review_id
        ).order_by(ReviewSnapshot.snapshot_version.desc())
        snapshot = db.scalars(snapshot_stmt).first()
        
        if not snapshot:
            raise HTTPException(status_code=404, detail="Snapshot not found for review. Freeze review first.")
            
        prompt = f"System prompt: Ground yourself in snapshot data: {snapshot.evidence_snapshot}. Raise investigations."
        
        ai_run = AIRun(
            id=uuid.uuid4(),
            organization_id=org_id,
            task_type="INVESTIGATE",
            prompt_template_version="v1",
            model_provider="mock",
            model_name="mock-model",
            token_count_input=120,
            token_count_output=60,
            latency_ms=15,
            created_by_user_id=context.user_id,
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(ai_run)
        db.commit()
        
        try:
            completion = cls.provider_adapter.generate_completion(prompt, "INVESTIGATE", org_id, context.user_id)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")
        questions = [q.strip() for q in completion.split("\n") if q.strip()]
        
        return {
            "questions": questions,
            "confounders": ["Potential seasonal demand fluctuations", "Mismatched baseline adjustment"],
            "ai_run_id": ai_run.id
        }

    @classmethod
    def explain_recommendation(cls, db: Session, context: AuthorizationContext, recommendation_id: uuid.UUID) -> dict:
        org_id = context.active_organization_id
        rec = RecommendationsAndDecisionsService.get_recommendation(db, org_id, recommendation_id)
        
        prompt = f"Explain recommendation type {rec.recommendation_type} support state {rec.support_state} for rationale {rec.rationale}"
        
        ai_run = AIRun(
            id=uuid.uuid4(),
            organization_id=org_id,
            task_type="EXPLAIN_RECOMMENDATION",
            prompt_template_version="v1",
            model_provider="mock",
            model_name="mock-model",
            token_count_input=110,
            token_count_output=70,
            latency_ms=12,
            created_by_user_id=context.user_id,
            created_at=datetime_cls.now(timezone.utc)
        )
        db.add(ai_run)
        db.commit()
        
        try:
            explanation = cls.provider_adapter.generate_completion(prompt, "EXPLAIN_RECOMMENDATION", org_id, context.user_id)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)}")
        
        return {
            "explanation": explanation,
            "structured_factors": {
                "recommendation_type": rec.recommendation_type,
                "support_state": rec.support_state,
                "rationale": rec.rationale
            },
            "ai_run_id": ai_run.id
        }
