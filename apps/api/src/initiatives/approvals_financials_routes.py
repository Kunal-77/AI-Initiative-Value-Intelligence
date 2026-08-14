import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.identity.authorization import AuthorizationContext, require_capability
from src.initiatives.schemas import (
    ApprovalItemResponse,
    WorkflowTaskResponse,
    WorkflowCommentResponse,
    WorkflowCommentCreate,
    WorkflowAuditLogResponse,
    GovernanceMetricsResponse,
    ExecutiveFinancialMetricsResponse,
    BenefitItemResponse,
    CostItemLedgerResponse
)
from src.initiatives.service import WorkflowApprovalsService, ExecutiveFinancialsService

router = APIRouter(prefix="", tags=["Approvals & Financials"])

@router.get("/approvals", response_model=List[ApprovalItemResponse])
def get_approvals_queue(
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return WorkflowApprovalsService.get_approvals_queue(db, context.active_organization_id)

@router.get("/approvals/tasks", response_model=List[WorkflowTaskResponse])
def get_workflow_tasks(
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return WorkflowApprovalsService.get_workflow_tasks(db, context.active_organization_id)

@router.get("/approvals/{id}/comments", response_model=List[WorkflowCommentResponse])
def get_workflow_comments(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return WorkflowApprovalsService.get_workflow_comments(db, context.active_organization_id, id)

@router.post("/approvals/{id}/comments", response_model=WorkflowCommentResponse, status_code=status.HTTP_201_CREATED)
def add_workflow_comment(
    id: uuid.UUID,
    data: WorkflowCommentCreate,
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    author = context.display_name or "David Miller (PM)"
    role = "Executive"
    return WorkflowApprovalsService.add_workflow_comment(
        db=db,
        org_id=context.active_organization_id,
        approval_id=id,
        author=author,
        role=role,
        content=data.content
    )

@router.get("/approvals/{id}/audit-logs", response_model=List[WorkflowAuditLogResponse])
def get_workflow_audit_logs(
    id: uuid.UUID,
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return WorkflowApprovalsService.get_workflow_audit_logs(db, context.active_organization_id, id)

@router.get("/approvals/metrics", response_model=GovernanceMetricsResponse)
def get_governance_metrics(
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return WorkflowApprovalsService.get_governance_metrics(db, context.active_organization_id)

@router.post("/approvals/{id}/action", response_model=ApprovalItemResponse)
def execute_approval_action(
    id: uuid.UUID,
    action: str = Query(...),
    reason: Optional[str] = Query(None),
    context: AuthorizationContext = Depends(require_capability("edit_initiative")),
    db: Session = Depends(get_db)
):
    actor = context.display_name or "David Miller (PM)"
    return WorkflowApprovalsService.execute_approval_action(
        db=db,
        org_id=context.active_organization_id,
        approval_id=id,
        actor=actor,
        action=action,
        reason=reason
    )

@router.get("/financials/summary", response_model=ExecutiveFinancialMetricsResponse)
def get_financials_summary(
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return ExecutiveFinancialsService.get_financials_summary(db, context.active_organization_id)

@router.get("/financials/benefits", response_model=List[BenefitItemResponse])
def get_financials_benefits(
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return ExecutiveFinancialsService.get_financials_benefits(db, context.active_organization_id)

@router.get("/financials/costs", response_model=List[CostItemLedgerResponse])
def get_financials_costs(
    context: AuthorizationContext = Depends(require_capability("view_initiative")),
    db: Session = Depends(get_db)
):
    return ExecutiveFinancialsService.get_financials_costs(db, context.active_organization_id)
