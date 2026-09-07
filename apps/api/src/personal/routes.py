import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.identity.authorization import require_personal_workspace, AuthorizationContext
from src.personal.service import PersonalService
from src.personal.ingestion_service import IngestionService
from src.personal.schemas import (
    PersonalDashboardResponse,
    SubscriptionResponse,
    SubscriptionCreate,
    PaymentMethodResponse,
    PaymentMethodCreate,
    SubscriptionCategoryResponse,
    UsageRecordResponse,
    UsageRecordCreate,
    BankConnectionCreate,
    BankConnectionResponse,
    BankTransactionResponse,
    BankSyncResponse,
    SubscriptionCandidateResponse,
)

router = APIRouter(prefix="/personal")


@router.get("/dashboard", response_model=PersonalDashboardResponse)
def get_personal_dashboard(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Fetch aggregated metrics and schedules for the personal workspace.
    """
    return PersonalService.get_dashboard(db, context.user_id)


@router.get("/subscriptions", response_model=List[SubscriptionResponse])
def get_personal_subscriptions(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List all active/trial/paused personal subscriptions.
    """
    return PersonalService.get_subscriptions(db, context.user_id)


@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_personal_subscription(
    data: SubscriptionCreate,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Register a generic, AI, or Cloud subscription.
    """
    try:
        return PersonalService.create_subscription(db, context.user_id, data)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )


@router.delete("/subscriptions/{id}")
def delete_personal_subscription(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Cancel/Delete a specific personal subscription.
    """
    success = PersonalService.delete_subscription(db, context.user_id, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found."
        )
    return {"status": "success", "message": "Subscription cancelled successfully."}


@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
def get_personal_payment_methods(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List all saved payment methods.
    """
    return PersonalService.get_payment_methods(db, context.user_id)


@router.post("/payment-methods", response_model=PaymentMethodResponse, status_code=status.HTTP_201_CREATED)
def create_personal_payment_method(
    data: PaymentMethodCreate,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Save a new payment method.
    """
    return PersonalService.create_payment_method(db, context.user_id, data)


@router.get("/categories", response_model=List[SubscriptionCategoryResponse])
def get_personal_categories(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List available subscription categories.
    """
    return PersonalService.get_categories(db)


@router.get("/usage", response_model=List[UsageRecordResponse])
def get_personal_usage(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List logged usage records.
    """
    return PersonalService.get_usage_records(db, context.user_id)


@router.post("/usage", response_model=UsageRecordResponse, status_code=status.HTTP_201_CREATED)
def create_personal_usage(
    data: UsageRecordCreate,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Log usage metrics for an active AI/Cloud subscription.
    """
    try:
        return PersonalService.create_usage_record(db, context.user_id, data)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )


@router.get("/bank-connections", response_model=List[BankConnectionResponse])
def get_bank_connections(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List user's connected financial institutions and sync statuses.
    """
    return PersonalService.get_bank_connections(db, context.user_id)


@router.post("/bank-connections", response_model=BankConnectionResponse, status_code=status.HTTP_201_CREATED)
def create_bank_connection(
    data: BankConnectionCreate,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Link a new simulated financial connection.
    """
    return PersonalService.create_bank_connection(db, context.user_id, data)


@router.post("/bank-connections/{id}/sync", response_model=BankSyncResponse)
def sync_bank_connection(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Trigger transaction ingestion and recurring cadence detection for connection.
    """
    try:
        new_txns, candidates = IngestionService.sync_connection(db, context.user_id, id)
        conn = PersonalService.get_bank_connections(db, context.user_id)[0]
        return BankSyncResponse(
            status="success",
            message=f"Synced {new_txns} new transactions. {candidates} recurring candidates identified.",
            new_transactions=new_txns,
            candidates_detected=candidates,
            connection=BankConnectionResponse.model_validate(conn),
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(err)}"
        )


@router.delete("/bank-connections/{id}")
def delete_bank_connection(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Disconnect a financial account connection.
    """
    success = PersonalService.delete_bank_connection(db, context.user_id, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank connection not found or unauthorized."
        )
    return {"status": "success", "message": "Bank connection disconnected."}


@router.get("/candidates", response_model=List[SubscriptionCandidateResponse])
def get_subscription_candidates(
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List pending detected recurring subscription candidates.
    """
    return PersonalService.get_candidates(db, context.user_id)


@router.get("/transactions", response_model=List[BankTransactionResponse])
def get_bank_transactions(
    limit: int = 100,
    offset: int = 0,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    List ingested bank transactions for the user.
    """
    return PersonalService.get_bank_transactions(db, context.user_id, limit=limit, offset=offset)


@router.post("/candidates/{id}/confirm", response_model=SubscriptionResponse)
def confirm_subscription_candidate(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Convert a detected candidate into an active Subscription with duplicate protection.
    """
    try:
        return IngestionService.confirm_candidate(db, context.user_id, id)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err)
        )


@router.post("/candidates/{id}/dismiss")
def dismiss_subscription_candidate(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_personal_workspace),
    db: Session = Depends(get_db),
):
    """
    Dismiss a candidate so it is not shown as a recurring subscription candidate.
    """
    success = IngestionService.dismiss_candidate(db, context.user_id, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found or unauthorized."
        )
    return {"status": "success", "message": "Candidate dismissed."}

