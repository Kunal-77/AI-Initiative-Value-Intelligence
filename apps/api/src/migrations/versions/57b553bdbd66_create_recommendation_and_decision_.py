"""create_recommendation_and_decision_tables

Revision ID: 57b553bdbd66
Revises: 46b62ed6bc01
Create Date: 2026-07-30 14:21:32.387501

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '57b553bdbd66'
down_revision: Union[str, None] = '46b62ed6bc01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add unique constraints to existing tables
    op.create_unique_constraint('uq_reviews_initiative_composite', 'reviews', ['organization_id', 'id', 'initiative_id'])
    op.create_unique_constraint('uq_init_metrics_initiative_composite', 'initiative_metrics', ['organization_id', 'id', 'initiative_id'])
    op.create_unique_constraint('uq_observations_initiative_composite', 'observations', ['organization_id', 'id', 'initiative_id'])

    # 2. Alter review_snapshots table to add initiative_id column and constraints
    op.add_column('review_snapshots', sa.Column('initiative_id', sa.Uuid(), nullable=True))
    op.execute("""
        UPDATE review_snapshots rs
        SET initiative_id = r.initiative_id
        FROM reviews r
        WHERE rs.review_id = r.id
    """)
    op.alter_column('review_snapshots', 'initiative_id', nullable=False)
    
    op.create_unique_constraint('uq_snapshots_init_composite', 'review_snapshots', ['organization_id', 'initiative_id', 'id'])
    op.create_foreign_key(
        'fk_snapshots_review_initiative_composite',
        'review_snapshots', 'reviews',
        ['organization_id', 'review_id', 'initiative_id'],
        ['organization_id', 'id', 'initiative_id'],
        ondelete='RESTRICT'
    )

    # 3. Create ai_runs table
    op.create_table('ai_runs',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('task_type', sa.String(length=50), nullable=False),
        sa.Column('prompt_template_version', sa.String(length=50), nullable=False),
        sa.Column('model_provider', sa.String(length=50), nullable=False),
        sa.Column('model_name', sa.String(length=50), nullable=False),
        sa.Column('token_count_input', sa.Integer(), nullable=True),
        sa.Column('token_count_output', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('created_by_user_id', sa.Uuid(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("task_type IN ('DRAFT_SUMMARY', 'INVESTIGATE', 'SUGGEST_MAPPING', 'EXPLAIN_RECOMMENDATION')", name='chk_ai_task_type'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_ai_runs_tenant')
    )
    op.create_index(op.f('ix_ai_runs_organization_id'), 'ai_runs', ['organization_id'], unique=False)

    # 4. Create recommendations table
    op.create_table('recommendations',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('initiative_id', sa.Uuid(), nullable=False),
        sa.Column('review_snapshot_id', sa.Uuid(), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('recommendation_type', sa.String(length=50), nullable=False),
        sa.Column('support_state', sa.String(length=50), nullable=False),
        sa.Column('rationale', sa.String(), nullable=False),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('policy_version', sa.String(length=50), nullable=False),
        sa.Column('ai_contributed', sa.Boolean(), nullable=False),
        sa.Column('ai_run_id', sa.Uuid(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("recommendation_type IN ('SCALE', 'KEEP', 'OPTIMIZE', 'STOP', 'CONTINUE_MEASUREMENT')", name='chk_rec_type'),
        sa.CheckConstraint("support_state IN ('SUPPORTED', 'SUPPORTED_WITH_CONDITIONS', 'CONFLICTING', 'INSUFFICIENT')", name='chk_support_state'),
        sa.ForeignKeyConstraint(['ai_run_id'], ['ai_runs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(
            ['organization_id', 'initiative_id', 'review_snapshot_id'],
            ['review_snapshots.organization_id', 'review_snapshots.initiative_id', 'review_snapshots.id'],
            name='fk_recommendations_snapshot_composite',
            ondelete='RESTRICT'
        ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_recommendations_tenant'),
        sa.UniqueConstraint('organization_id', 'id', 'initiative_id', name='uq_recommendations_initiative_composite'),
        sa.UniqueConstraint('organization_id', 'review_snapshot_id', 'version_number', name='uq_recommendation_version')
    )
    op.create_index(op.f('ix_recommendations_organization_id'), 'recommendations', ['organization_id'], unique=False)
    op.create_index(op.f('ix_recommendations_initiative_id'), 'recommendations', ['initiative_id'], unique=False)
    op.create_index(op.f('ix_recommendations_review_snapshot_id'), 'recommendations', ['review_snapshot_id'], unique=False)

    # 5. Create decisions table
    op.create_table('decisions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('initiative_id', sa.Uuid(), nullable=False),
        sa.Column('review_id', sa.Uuid(), nullable=True),
        sa.Column('recommendation_id', sa.Uuid(), nullable=True),
        sa.Column('decision_type', sa.String(length=50), nullable=False),
        sa.Column('decision_source', sa.String(length=50), nullable=False),
        sa.Column('rationale', sa.String(), nullable=True),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('decided_by_user_id', sa.Uuid(), nullable=False),
        sa.Column('decided_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('external_reference', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("decision_type IN ('APPROVE', 'REJECT', 'SCALE', 'KEEP', 'OPTIMIZE', 'STOP', 'DEFER', 'REQUEST_ANALYSIS', 'OTHER')", name='chk_decision_type'),
        sa.CheckConstraint("decision_source IN ('IN_PRODUCT', 'EXTERNAL')", name='chk_decision_source'),
        sa.ForeignKeyConstraint(['decided_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(
            ['organization_id', 'review_id', 'initiative_id'],
            ['reviews.organization_id', 'reviews.id', 'reviews.initiative_id'],
            name='fk_decisions_review_composite',
            ondelete='RESTRICT'
        ),
        sa.ForeignKeyConstraint(
            ['organization_id', 'recommendation_id', 'initiative_id'],
            ['recommendations.organization_id', 'recommendations.id', 'recommendations.initiative_id'],
            name='fk_decisions_recommendation_composite',
            ondelete='SET NULL'
        ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_decisions_tenant'),
        sa.UniqueConstraint('organization_id', 'id', 'initiative_id', name='uq_decisions_initiative_composite')
    )
    op.create_index(op.f('ix_decisions_organization_id'), 'decisions', ['organization_id'], unique=False)
    op.create_index(op.f('ix_decisions_initiative_id'), 'decisions', ['initiative_id'], unique=False)
    op.create_index(op.f('ix_decisions_review_id'), 'decisions', ['review_id'], unique=False)
    op.create_index(op.f('ix_decisions_recommendation_id'), 'decisions', ['recommendation_id'], unique=False)

    # 6. Create decision_expectations table
    op.create_table('decision_expectations',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('initiative_id', sa.Uuid(), nullable=False),
        sa.Column('decision_id', sa.Uuid(), nullable=False),
        sa.Column('initiative_metric_id', sa.Uuid(), nullable=False),
        sa.Column('expected_value', sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column('expected_change', sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('assumptions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('period_end > period_start', name='chk_expectations_dates'),
        sa.CheckConstraint('expected_value IS NOT NULL OR expected_change IS NOT NULL', name='chk_expectations_values'),
        sa.ForeignKeyConstraint(
            ['organization_id', 'decision_id', 'initiative_id'],
            ['decisions.organization_id', 'decisions.id', 'decisions.initiative_id'],
            name='fk_expectations_decision_composite',
            ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(
            ['organization_id', 'initiative_metric_id', 'initiative_id'],
            ['initiative_metrics.organization_id', 'initiative_metrics.id', 'initiative_metrics.initiative_id'],
            name='fk_expectations_metric_composite',
            ondelete='RESTRICT'
        ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_dec_expectations_tenant')
    )
    op.create_index(op.f('ix_decision_expectations_organization_id'), 'decision_expectations', ['organization_id'], unique=False)
    op.create_index(op.f('ix_decision_expectations_initiative_id'), 'decision_expectations', ['initiative_id'], unique=False)
    op.create_index(op.f('ix_decision_expectations_decision_id'), 'decision_expectations', ['decision_id'], unique=False)
    op.create_index(op.f('ix_decision_expectations_initiative_metric_id'), 'decision_expectations', ['initiative_metric_id'], unique=False)

    # 7. Create outcomes table
    op.create_table('outcomes',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('initiative_id', sa.Uuid(), nullable=False),
        sa.Column('decision_id', sa.Uuid(), nullable=True),
        sa.Column('initiative_metric_id', sa.Uuid(), nullable=False),
        sa.Column('observation_id', sa.Uuid(), nullable=False),
        sa.Column('variance_from_expected', sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column('validation_state', sa.String(length=50), nullable=False),
        sa.Column('validated_by_user_id', sa.Uuid(), nullable=True),
        sa.Column('validated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("validation_state IN ('UNVALIDATED', 'VALIDATED', 'DISPUTED')", name='chk_outcome_validation'),
        sa.CheckConstraint(
            "(validation_state = 'UNVALIDATED' AND validated_by_user_id IS NULL AND validated_at IS NULL AND rejection_reason IS NULL) OR "
            "(validation_state = 'VALIDATED' AND validated_by_user_id IS NOT NULL AND validated_at IS NOT NULL AND rejection_reason IS NULL) OR "
            "(validation_state = 'DISPUTED' AND rejection_reason IS NOT NULL AND LTRIM(rejection_reason) != '')",
            name='chk_outcome_validation_fields'
        ),
        sa.ForeignKeyConstraint(
            ['organization_id', 'decision_id', 'initiative_id'],
            ['decisions.organization_id', 'decisions.id', 'decisions.initiative_id'],
            name='fk_outcomes_decision_composite',
            ondelete='SET NULL'
        ),
        sa.ForeignKeyConstraint(
            ['organization_id', 'initiative_metric_id', 'initiative_id'],
            ['initiative_metrics.organization_id', 'initiative_metrics.id', 'initiative_metrics.initiative_id'],
            name='fk_outcomes_metric_composite',
            ondelete='RESTRICT'
        ),
        sa.ForeignKeyConstraint(
            ['organization_id', 'observation_id', 'initiative_id'],
            ['observations.organization_id', 'observations.id', 'observations.initiative_id'],
            name='fk_outcomes_observation_composite',
            ondelete='RESTRICT'
        ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['validated_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_outcomes_tenant')
    )
    op.create_index(op.f('ix_outcomes_organization_id'), 'outcomes', ['organization_id'], unique=False)
    op.create_index(op.f('ix_outcomes_initiative_id'), 'outcomes', ['initiative_id'], unique=False)
    op.create_index(op.f('ix_outcomes_decision_id'), 'outcomes', ['decision_id'], unique=False)
    op.create_index(op.f('ix_outcomes_initiative_metric_id'), 'outcomes', ['initiative_metric_id'], unique=False)
    op.create_index(op.f('ix_outcomes_observation_id'), 'outcomes', ['observation_id'], unique=False)

    # 8. Create learnings table
    op.create_table('learnings',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('initiative_id', sa.Uuid(), nullable=False),
        sa.Column('decision_id', sa.Uuid(), nullable=True),
        sa.Column('summary', sa.String(), nullable=False),
        sa.Column('evidence_strength_state', sa.String(length=50), nullable=True),
        sa.Column('applicability', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_by_user_id', sa.Uuid(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ['organization_id', 'decision_id', 'initiative_id'],
            ['decisions.organization_id', 'decisions.id', 'decisions.initiative_id'],
            name='fk_learnings_decision_composite',
            ondelete='SET NULL'
        ),
        sa.ForeignKeyConstraint(['organization_id', 'initiative_id'], ['initiatives.organization_id', 'initiatives.id'], name='fk_learnings_initiative', ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_learnings_tenant')
    )
    op.create_index(op.f('ix_learnings_organization_id'), 'learnings', ['organization_id'], unique=False)
    op.create_index(op.f('ix_learnings_initiative_id'), 'learnings', ['initiative_id'], unique=False)
    op.create_index(op.f('ix_learnings_decision_id'), 'learnings', ['decision_id'], unique=False)


def downgrade() -> None:
    # 1. Drop M5 tables
    op.drop_table('learnings')
    op.drop_table('outcomes')
    op.drop_table('decision_expectations')
    op.drop_table('decisions')
    op.drop_table('recommendations')
    op.drop_table('ai_runs')

    # 2. Revert review_snapshots additions
    op.drop_constraint('fk_snapshots_review_initiative_composite', 'review_snapshots', type_='foreignkey')
    op.drop_constraint('uq_snapshots_init_composite', 'review_snapshots', type_='unique')
    op.drop_column('review_snapshots', 'initiative_id')

    # 3. Drop prerequisite unique constraints
    op.drop_constraint('uq_observations_initiative_composite', 'observations', type_='unique')
    op.drop_constraint('uq_init_metrics_initiative_composite', 'initiative_metrics', type_='unique')
    op.drop_constraint('uq_reviews_initiative_composite', 'reviews', type_='unique')
