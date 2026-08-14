import pytest
import uuid
from datetime import datetime, timezone, date, timedelta
from sqlalchemy import select

from src.identity.service import IdentityService
from src.identity.models import Organization, User, OrganizationMembership
from src.initiatives.models import (
    Initiative, Investment, InvestmentCostItem, GovernanceApproval,
    WorkflowTask, WorkflowComment, WorkflowAuditLog, FinancialBenefit
)
from src.initiatives.service import InitiativesService, WorkflowApprovalsService, ExecutiveFinancialsService
from src.identity.authorization import AuthorizationContext

def test_approvals_auto_provision_and_retrieval(db):
    """
    Test that query queue auto-provisions approvals for existing active initiatives,
    and returns them cleanly.
    """
    # Create tenant context
    org = IdentityService.get_or_create_organization(db, "org_clerk_gov1", "Gov Org 1")
    user = IdentityService.get_or_create_user(db, "user_clerk_gov1", "Gov User 1", "gov1@example.com")
    IdentityService.get_or_create_membership(db, org.id, user.id, "ORG_ADMIN")
    
    # Create two initiatives
    init_stmt = select(Initiative).where(Initiative.organization_id == org.id)
    inits_before = db.execute(init_stmt).scalars().all()
    assert len(inits_before) == 0
    
    # Create mock auth context
    context = AuthorizationContext(
        user_id=user.id,
        clerk_user_id="user_clerk_gov1",
        active_organization_id=org.id,
        role="ORG_ADMIN",
        capabilities=["view_initiative", "create_initiative", "edit_initiative"]
    )
    
    init1 = InitiativesService.create_initiative(
        db=db,
        context=context,
        name="Platform Efficiency Improvement",
        business_area="Engineering",
        problem_statement="High CPU overhead",
        proposed_intervention="Refactor code",
        expected_business_outcome="Reduce latency by 10%",
        planned_start_date=date.today()
    )
    
    # Assert GovernanceApproval and WorkflowTask were auto-created by create_initiative
    stmt_app = select(GovernanceApproval).where(
        GovernanceApproval.organization_id == org.id,
        GovernanceApproval.initiative_id == init1.id
    )
    approval1 = db.execute(stmt_app).scalar_one_or_none()
    assert approval1 is not None
    assert approval1.current_stage == "DRAFT"
    
    # Fetch queue
    queue = WorkflowApprovalsService.get_approvals_queue(db, org.id)
    assert len(queue) == 1
    assert queue[0].initiative_id == init1.id
    
    # Fetch tasks
    tasks = WorkflowApprovalsService.get_workflow_tasks(db, org.id)
    assert len(tasks) == 1
    assert tasks[0].approval_id == approval1.id

def test_approvals_action_transitions_and_audit(db):
    """
    Test approval action transitions (APPROVE, REJECT, REQUEST_CHANGES)
    and check audit log and comments integration.
    """
    org = IdentityService.get_or_create_organization(db, "org_clerk_gov2", "Gov Org 2")
    user = IdentityService.get_or_create_user(db, "user_clerk_gov2", "Gov User 2", "gov2@example.com")
    context = AuthorizationContext(
        user_id=user.id,
        clerk_user_id="user_clerk_gov2",
        active_organization_id=org.id,
        role="ORG_ADMIN",
        capabilities=["view_initiative", "create_initiative", "edit_initiative"]
    )
    
    init = InitiativesService.create_initiative(
        db=db,
        context=context,
        name="Security Policy Automation",
        business_area="InfoSec",
        problem_statement="Manual compliance",
        proposed_intervention="Deploy automation script",
        expected_business_outcome="100% compliance SLA",
        planned_start_date=date.today()
    )
    
    stmt_app = select(GovernanceApproval).where(GovernanceApproval.initiative_id == init.id)
    app = db.execute(stmt_app).scalar_one_or_none()
    assert app is not None
    assert app.current_stage == "DRAFT"
    
    # Submit Approval (DRAFT -> SUBMITTED)
    updated_app = WorkflowApprovalsService.execute_approval_action(
        db=db,
        org_id=org.id,
        approval_id=app.id,
        actor="Gov User 2",
        action="APPROVE",
        reason="Submitting for approval"
    )
    assert updated_app.current_stage == "SUBMITTED"
    
    # Audit log created
    logs = WorkflowApprovalsService.get_workflow_audit_logs(db, org.id, app.id)
    assert len(logs) == 1
    assert logs[0].action == "APPROVE"
    assert logs[0].previous_stage == "DRAFT"
    assert logs[0].new_stage == "SUBMITTED"
    
    # Add comment
    cmt = WorkflowApprovalsService.add_workflow_comment(
        db=db,
        org_id=org.id,
        approval_id=app.id,
        author="Gov User 2",
        role="Executive",
        content="Looks solid. Moving it forward."
    )
    assert cmt.content == "Looks solid. Moving it forward."
    
    # Fetch comments
    comments = WorkflowApprovalsService.get_workflow_comments(db, org.id, app.id)
    assert len(comments) == 1
    assert comments[0].content == "Looks solid. Moving it forward."

def test_financials_summary_and_tenant_isolation(db):
    """
    Test financials calculation math and check tenant isolation controls.
    """
    # Tenant A
    org_a = IdentityService.get_or_create_organization(db, "org_clerk_fina", "Fin Org A")
    user_a = IdentityService.get_or_create_user(db, "user_clerk_fina", "Fin User A", "fina@example.com")
    context_a = AuthorizationContext(
        user_id=user_a.id,
        clerk_user_id="user_clerk_fina",
        active_organization_id=org_a.id,
        role="ORG_ADMIN",
        capabilities=["view_initiative", "create_initiative", "edit_initiative"]
    )
    
    init_a = InitiativesService.create_initiative(
        db=db,
        context=context_a,
        name="AWS Cost Optimization A",
        business_area="Engineering",
        problem_statement="High hosting costs",
        proposed_intervention="Clean up unused instances",
        expected_business_outcome="Save $100k",
        planned_start_date=date.today()
    )
    
    # Tenant B
    org_b = IdentityService.get_or_create_organization(db, "org_clerk_finb", "Fin Org B")
    user_b = IdentityService.get_or_create_user(db, "user_clerk_finb", "Fin User B", "finb@example.com")
    context_b = AuthorizationContext(
        user_id=user_b.id,
        clerk_user_id="user_clerk_finb",
        active_organization_id=org_b.id,
        role="ORG_ADMIN",
        capabilities=["view_initiative", "create_initiative", "edit_initiative"]
    )
    
    init_b = InitiativesService.create_initiative(
        db=db,
        context=context_b,
        name="GCP Cost Optimization B",
        business_area="Engineering",
        problem_statement="High compute costs",
        proposed_intervention="Spot instances",
        expected_business_outcome="Save $200k",
        planned_start_date=date.today()
    )
    
    # Financials for Tenant A will auto-provision cost/benefit items
    summary_a = ExecutiveFinancialsService.get_financials_summary(db, org_a.id)
    assert summary_a["totalPlannedInvestment"] == 550000.0
    assert summary_a["totalActualSpend"] == 500000.0
    assert summary_a["totalExpectedBenefit"] == 1050000.0
    assert summary_a["totalRealizedBenefit"] == 1070000.0
    
    # ROI calculation verification: ((1,070,000 - 500,000) / 500,000) * 100 = 114%
    assert summary_a["overallPortfolioRoi"] == pytest.approx(114.0, 0.1)
    
    # Benefits list verification
    benefits_a = ExecutiveFinancialsService.get_financials_benefits(db, org_a.id)
    assert len(benefits_a) == 2
    assert benefits_a[0]["initiative_name"] == "AWS Cost Optimization A"
    
    # Tenant Isolation Verification
    # Tenant B should NOT be able to view Tenant A's comments or audit logs
    stmt_app_a = select(GovernanceApproval).where(GovernanceApproval.initiative_id == init_a.id)
    app_a = db.execute(stmt_app_a).scalar_one_or_none()
    
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as excinfo:
        WorkflowApprovalsService.get_workflow_comments(db, org_b.id, app_a.id)
    assert excinfo.value.status_code == 404
    
    with pytest.raises(HTTPException) as excinfo:
        WorkflowApprovalsService.execute_approval_action(
            db=db,
            org_id=org_b.id,
            approval_id=app_a.id,
            actor="User B",
            action="APPROVE"
        )
    assert excinfo.value.status_code == 404
