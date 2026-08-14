"""add approvals and financials

Revision ID: 8ea6f8e71b2d
Revises: f76e1a48c90b
Create Date: 2026-08-12 20:31:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '8ea6f8e71b2d'
down_revision: Union[str, None] = 'f76e1a48c90b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create governance_approvals
    op.create_table(
        'governance_approvals',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('initiative_id', sa.UUID(), nullable=False),
        sa.Column('requested_by', sa.String(length=255), nullable=False),
        sa.Column('owner', sa.String(length=255), nullable=False),
        sa.Column('current_stage', sa.String(length=50), nullable=False),
        sa.Column('requested_budget', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('expected_outcome', sa.Text(), nullable=True),
        sa.Column('ai_confidence_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('risk_level', sa.String(length=50), nullable=False),
        sa.Column('submitted_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_governance_approvals_org', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'initiative_id'], ['initiatives.organization_id', 'initiatives.id'], name='fk_governance_approvals_init_composite', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_governance_approvals_tenant'),
        sa.UniqueConstraint('organization_id', 'id', 'initiative_id', name='uq_governance_approvals_composite')
    )

    # 2. Create workflow_tasks
    op.create_table(
        'workflow_tasks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('approval_id', sa.UUID(), nullable=False),
        sa.Column('task_title', sa.String(length=255), nullable=False),
        sa.Column('assignee', sa.String(length=255), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_workflow_tasks_org', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'approval_id'], ['governance_approvals.organization_id', 'governance_approvals.id'], name='fk_workflow_tasks_approval_composite', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_workflow_tasks_tenant')
    )

    # 3. Create workflow_comments
    op.create_table(
        'workflow_comments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('approval_id', sa.UUID(), nullable=False),
        sa.Column('author', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_workflow_comments_org', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'approval_id'], ['governance_approvals.organization_id', 'governance_approvals.id'], name='fk_workflow_comments_approval_composite', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_workflow_comments_tenant')
    )

    # 4. Create workflow_audit_logs
    op.create_table(
        'workflow_audit_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('approval_id', sa.UUID(), nullable=False),
        sa.Column('actor', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('previous_stage', sa.String(length=50), nullable=False),
        sa.Column('new_stage', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_workflow_audit_logs_org', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'approval_id'], ['governance_approvals.organization_id', 'governance_approvals.id'], name='fk_workflow_audit_logs_approval_composite', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_workflow_audit_logs_tenant')
    )

    # 5. Create financial_benefits
    op.create_table(
        'financial_benefits',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('initiative_id', sa.UUID(), nullable=False),
        sa.Column('benefit_name', sa.String(length=255), nullable=False),
        sa.Column('owner', sa.String(length=255), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('target_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('actual_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('variance_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('evidence_source', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_financial_benefits_org', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'initiative_id'], ['initiatives.organization_id', 'initiatives.id'], name='fk_financial_benefits_init_composite', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_financial_benefits_tenant')
    )

    # 6. Add columns to investment_cost_items
    op.add_column('investment_cost_items', sa.Column('expense_name', sa.String(length=255), nullable=True))
    op.add_column('investment_cost_items', sa.Column('vendor', sa.String(length=255), nullable=True))
    op.add_column('investment_cost_items', sa.Column('department', sa.String(length=255), nullable=True))
    op.add_column('investment_cost_items', sa.Column('date', sa.Date(), nullable=True))
    op.add_column('investment_cost_items', sa.Column('status', sa.String(length=50), nullable=True))
    op.add_column('investment_cost_items', sa.Column('approval_owner', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('investment_cost_items', 'approval_owner')
    op.drop_column('investment_cost_items', 'status')
    op.drop_column('investment_cost_items', 'date')
    op.drop_column('investment_cost_items', 'department')
    op.drop_column('investment_cost_items', 'vendor')
    op.drop_column('investment_cost_items', 'expense_name')

    op.drop_table('financial_benefits')
    op.drop_table('workflow_audit_logs')
    op.drop_table('workflow_comments')
    op.drop_table('workflow_tasks')
    op.drop_table('governance_approvals')
