import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.identity.authorization import AuthorizationContext, require_capability
from src.initiatives.schemas import (
    InitiativeCreate,
    InitiativeUpdate,
    InitiativeResponse,
    CostItemCreate,
    CostItemResponse,
    InvestmentResponse,
    InterventionCreate,
    InterventionResponse,
    ClaimCreate,
    ClaimResponse,
    EvidenceCreate,
    EvidenceResponse,
    EvidenceStrengthAssessmentResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewReadinessResponse,
    ReviewSnapshotResponse,
    RecommendationResponse,
    AIDraftSummaryResponse,
    AIInvestigateResponse,
    AIExplanationResponse,
    AIRunResponse,
    DecisionCreate,
    DecisionResponse,
    DecisionExpectationCreate,
    DecisionExpectationResponse,
    OutcomeCreate,
    OutcomeResponse,
    LearningResponse
)
from src.initiatives.service import InitiativesService, ReviewsAndEvidenceService, RecommendationsAndDecisionsService, GroundedAIService

router = APIRouter(prefix="/initiatives", tags=["Initiatives"])
reviews_evidence_router = APIRouter(tags=["Evidence & Reviews"])

@router.post("", response_model=InitiativeResponse, status_code=status.HTTP_201_CREATED)
def create_initiative(
    data: InitiativeCreate,
    context: AuthorizationContext = Depends(require_capability("create_initiative")),
    db: Session = Depends(get_db)
):
    """
    Creates a new initiative in DRAFT state and initializes a DRAFT investment version 1.
    """
    return InitiativesService.create_initiative(
        db=db,
        context=context,
        name=data.name,
        business_area=data.business_area,
        problem_statement=data.problem_statement,
        proposed_intervention=data.proposed_intervention,
        expected_business_outcome=data.expected_business_outcome,
        planned_start_date=data.planned_start_date
    )

@router.get("", response_model=List[InitiativeResponse])
def list_initiatives(
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    """
    Lists all initiatives for the active tenant organization.
    """
    return InitiativesService.list_initiatives(db=db, org_id=context.active_organization_id)

@router.get("/{id}", response_model=InitiativeResponse)
def get_initiative(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    """
    Retrieves the initiative details, strictly matching organization tenancy.
    """
    return InitiativesService.get_initiative(db=db, org_id=context.active_organization_id, initiative_id=id)

@router.put("/{id}", response_model=InitiativeResponse)
def update_initiative(
    id: uuid.UUID,
    data: InitiativeUpdate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    """
    Modifies initiative parameters. If initiative is in ACTIVE state, triggers a version snapshot.
    """
    update_data = data.model_dump(exclude_unset=True)
    return InitiativesService.update_initiative(
        db=db,
        context=context,
        initiative_id=id,
        data=update_data
    )

@router.post("/{id}/transition", response_model=InitiativeResponse)
def transition_lifecycle(
    id: uuid.UUID,
    target_state: str = Query(..., description="DRAFT, SUBMITTED, ACTIVE, COMPLETED, ABANDONED"),
    change_reason: Optional[str] = Query(None, description="Optional transition reason description"),
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    """
    Transitions the lifecycle state of an initiative, enforcing transition policy and capability mapping.
    """
    # Double check approve_initiative role for SUBMITTED -> ACTIVE transitions
    if target_state == "ACTIVE" and "approve_initiative" not in context.capabilities:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Insufficient capability to approve initiative."
        )
    return InitiativesService.transition_lifecycle(
        db=db,
        context=context,
        initiative_id=id,
        target_state=target_state,
        change_reason=change_reason
    )

@router.get("/{id}/investments/latest", response_model=InvestmentResponse)
def get_latest_investment(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    """
    Retrieves the latest investment version for an initiative, including dynamically derived planned vs actual sums.
    """
    invest = InitiativesService.get_latest_investment(
        db=db,
        org_id=context.active_organization_id,
        initiative_id=id
    )
    totals = InitiativesService.derive_investment_totals(db=db, investment_id=invest.id)
    
    # Cast/wrap response
    return InvestmentResponse(
        id=invest.id,
        organization_id=invest.organization_id,
        initiative_id=invest.initiative_id,
        version_number=invest.version_number,
        currency=invest.currency,
        period_start=invest.period_start,
        period_end=invest.period_end,
        status=invest.status,
        assumptions=invest.assumptions,
        created_by_user_id=invest.created_by_user_id,
        created_at=invest.created_at,
        total_planned_amount=totals["PLANNED"],
        total_actual_amount=totals["ACTUAL"],
        cost_items=invest.cost_items
    )

@router.post("/{id}/investments/cost-items", response_model=CostItemResponse, status_code=status.HTTP_201_CREATED)
def add_cost_item(
    id: uuid.UUID,
    data: CostItemCreate,
    context: AuthorizationContext = Depends(require_capability("manage_financials")),
    db: Session = Depends(get_db)
):
    """
    Registers a new planned or actual cost item to the current investment plan.
    If the current plan is APPROVED, automatically generates a new DRAFT investment version.
    """
    return InitiativesService.add_cost_item(
        db=db,
        context=context,
        initiative_id=id,
        category=data.category,
        value_type=data.value_type,
        amount=data.amount,
        currency=data.currency,
        recurrence=data.recurrence,
        source_reference=data.source_reference,
        assumption_note=data.assumption_note
    )

# Interventions
@router.post("/{id}/interventions", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(
    id: uuid.UUID,
    data: InterventionCreate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    from datetime import datetime as datetime_cls
    return ReviewsAndEvidenceService.create_intervention(
        db=db,
        context=context,
        initiative_id=id,
        action_type=data.action_type,
        title=data.title,
        description=data.description,
        reason=data.reason,
        effective_at=data.effective_at
    )

@router.get("/{id}/interventions", response_model=List[InterventionResponse])
def list_interventions(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.list_interventions(db=db, org_id=context.active_organization_id, initiative_id=id)

# Claims
@router.post("/{id}/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(
    id: uuid.UUID,
    data: ClaimCreate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.create_claim(db=db, context=context, initiative_id=id, claim_type=data.claim_type, statement=data.statement)

@router.get("/{id}/claims", response_model=List[ClaimResponse])
def list_claims(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.list_claims(db=db, org_id=context.active_organization_id, initiative_id=id)

@reviews_evidence_router.get("/claims/{claim_id}", response_model=ClaimResponse)
def get_claim(
    claim_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.get_claim(db=db, org_id=context.active_organization_id, claim_id=claim_id)

@reviews_evidence_router.get("/claims/{claim_id}/strength", response_model=EvidenceStrengthAssessmentResponse)
def get_claim_strength(
    claim_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    from datetime import datetime as datetime_cls, timezone
    res = ReviewsAndEvidenceService.get_claim_strength(db=db, org_id=context.active_organization_id, claim_id=claim_id)
    return EvidenceStrengthAssessmentResponse(
        id=uuid.uuid4(),
        organization_id=context.active_organization_id,
        claim_id=claim_id,
        state=res["state"],
        factors=res["factors"],
        confounders=res["confounders"],
        method_version="1.0",
        assessed_at=datetime_cls.now(timezone.utc),
        reviewed_by_user_id=context.user_id
    )

# Evidence
@reviews_evidence_router.post("/claims/{claim_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def create_evidence(
    claim_id: uuid.UUID,
    data: EvidenceCreate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.create_evidence(
        db=db,
        context=context,
        claim_id=claim_id,
        evidence_level=data.evidence_level,
        stance=data.stance,
        source_type=data.source_type,
        observation_id=data.observation_id,
        source_file_id=data.source_file_id,
        source_reference=data.source_reference,
        method=data.method,
        scope=data.scope,
        period_start=data.period_start,
        period_end=data.period_end,
        assumptions=data.assumptions,
        limitations=data.limitations
    )

@reviews_evidence_router.get("/claims/{claim_id}/evidence", response_model=List[EvidenceResponse])
def list_evidence(
    claim_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.list_evidence(db=db, org_id=context.active_organization_id, claim_id=claim_id)

@reviews_evidence_router.get("/evidence/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(
    evidence_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.get_evidence(db=db, org_id=context.active_organization_id, evidence_id=evidence_id)

@reviews_evidence_router.post("/evidence/{evidence_id}/validate", response_model=EvidenceResponse)
def validate_evidence(
    evidence_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.validate_evidence(db=db, context=context, evidence_id=evidence_id)

@reviews_evidence_router.post("/evidence/{evidence_id}/reject", response_model=EvidenceResponse)
def reject_evidence(
    evidence_id: uuid.UUID,
    reason: str = Query(..., min_length=1),
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.reject_evidence(db=db, context=context, evidence_id=evidence_id, reason=reason)

# Reviews
@router.post("/{id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    id: uuid.UUID,
    data: ReviewCreate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.create_review(
        db=db,
        context=context,
        initiative_id=id,
        review_type=data.review_type,
        scheduled_at=data.scheduled_at,
        decision_question=data.decision_question
    )

@router.get("/{id}/reviews", response_model=List[ReviewResponse])
def list_reviews(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.list_reviews(db=db, org_id=context.active_organization_id, initiative_id=id)

@reviews_evidence_router.get("/reviews/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.get_review(db=db, org_id=context.active_organization_id, review_id=review_id)

@reviews_evidence_router.get("/reviews/{review_id}/readiness", response_model=ReviewReadinessResponse)
def get_review_readiness(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    res = ReviewsAndEvidenceService.get_review_readiness(db=db, org_id=context.active_organization_id, review_id=review_id)
    return ReviewReadinessResponse(
        ready=res["ready"],
        blockers=res["blockers"],
        review=ReviewResponse.model_validate(res["review"])
    )

@reviews_evidence_router.post("/reviews/{review_id}/prepare", response_model=ReviewResponse)
def prepare_review(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.prepare_review(db=db, context=context, review_id=review_id)

@reviews_evidence_router.post("/reviews/{review_id}/freeze", response_model=ReviewSnapshotResponse, status_code=status.HTTP_201_CREATED)
def freeze_review(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("approve_initiative")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.freeze_review(db=db, context=context, review_id=review_id)

@reviews_evidence_router.post("/reviews/{review_id}/complete", response_model=ReviewResponse)
def complete_review(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("approve_initiative")),
    db: Session = Depends(get_db)
):
    return ReviewsAndEvidenceService.complete_review(db=db, context=context, review_id=review_id)

@reviews_evidence_router.get("/reviews/{review_id}/snapshot", response_model=ReviewSnapshotResponse)
def get_latest_review_snapshot(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    org_id = context.active_organization_id
    from src.initiatives.models import ReviewSnapshot
    stmt = select(ReviewSnapshot).where(
        ReviewSnapshot.organization_id == org_id,
        ReviewSnapshot.review_id == review_id
    ).order_by(ReviewSnapshot.snapshot_version.desc())
    snapshot = db.scalars(stmt).first()
    if not snapshot:
        raise HTTPException(status_code=404, detail="No snapshot found for this review.")
    return snapshot


# --- Milestone 5 Endpoints ---

@reviews_evidence_router.post("/reviews/{review_id}/recommendations", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def generate_recommendation(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.generate_recommendation(db, context, review_id)


@reviews_evidence_router.get("/reviews/{review_id}/recommendations", response_model=List[RecommendationResponse])
def list_recommendations(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.list_recommendations(db, context.active_organization_id, review_id)


@reviews_evidence_router.get("/recommendations/{id}", response_model=RecommendationResponse)
def get_recommendation(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.get_recommendation(db, context.active_organization_id, id)


@reviews_evidence_router.post("/reviews/{review_id}/ai/draft-summary", response_model=AIDraftSummaryResponse)
def draft_review_summary(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return GroundedAIService.draft_review_summary(db, context, review_id)


@reviews_evidence_router.post("/reviews/{review_id}/ai/investigate", response_model=AIInvestigateResponse)
def suggest_investigations(
    review_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return GroundedAIService.suggest_investigations(db, context, review_id)


@reviews_evidence_router.post("/recommendations/{recommendation_id}/ai/explain", response_model=AIExplanationResponse)
def explain_recommendation(
    recommendation_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return GroundedAIService.explain_recommendation(db, context, recommendation_id)


@reviews_evidence_router.post("/reviews/{review_id}/decisions", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def record_decision(
    review_id: uuid.UUID,
    data: DecisionCreate,
    context: AuthorizationContext = Depends(require_capability("record_decision")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.record_decision(db, context, review_id, data)


@reviews_evidence_router.get("/decisions/{id}", response_model=DecisionResponse)
def get_decision(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.get_decision(db, context.active_organization_id, id)


@reviews_evidence_router.get("/initiatives/{initiative_id}/decisions", response_model=List[DecisionResponse])
def list_initiative_decisions(
    initiative_id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.list_initiative_decisions(db, context.active_organization_id, initiative_id)


@reviews_evidence_router.post("/decisions/{id}/expectations", response_model=DecisionExpectationResponse, status_code=status.HTTP_201_CREATED)
def create_expectation(
    id: uuid.UUID,
    data: DecisionExpectationCreate,
    context: AuthorizationContext = Depends(require_capability("record_decision")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.create_expectation(db, context, id, data)


@reviews_evidence_router.get("/decisions/{id}/expectations", response_model=List[DecisionExpectationResponse])
def list_expectations(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.list_expectations(db, context.active_organization_id, id)


@reviews_evidence_router.post("/decisions/{id}/outcomes", response_model=OutcomeResponse, status_code=status.HTTP_201_CREATED)
def create_outcome(
    id: uuid.UUID,
    data: OutcomeCreate,
    context: AuthorizationContext = Depends(require_capability("record_decision")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.create_outcome(db, context, id, data)


@reviews_evidence_router.get("/decisions/{id}/outcomes", response_model=List[OutcomeResponse])
def list_decision_outcomes(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.list_decision_outcomes(db, context.active_organization_id, id)


@reviews_evidence_router.get("/outcomes/{id}", response_model=OutcomeResponse)
def get_outcome(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_portfolio")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.get_outcome(db, context.active_organization_id, id)


@reviews_evidence_router.post("/outcomes/{id}/validate", response_model=OutcomeResponse)
def validate_outcome(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    return RecommendationsAndDecisionsService.validate_outcome(db, context, id)


@reviews_evidence_router.post("/outcomes/{id}/dispute", response_model=OutcomeResponse)
def dispute_outcome(
    id: uuid.UUID,
    data: dict,  # expects {"reason": str}
    context: AuthorizationContext = Depends(require_capability("validate_metrics")),
    db: Session = Depends(get_db)
):
    reason = data.get("reason", "")
    return RecommendationsAndDecisionsService.dispute_outcome(db, context, id, reason)
