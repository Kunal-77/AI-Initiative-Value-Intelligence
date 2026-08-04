"""initial_identity_tables

Revision ID: 001
Revises: 
Create Date: 2026-07-29 20:13:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_org_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organizations_clerk_org_id'), 'organizations', ['clerk_org_id'], unique=True)

    # 2. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_user_id', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('email_snapshot', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)

    # 3. Create organization_memberships table
    op.create_table(
        'organization_memberships',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'user_id', name='uq_org_user')
    )
    op.create_index(op.f('ix_organization_memberships_organization_id'), 'organization_memberships', ['organization_id'], unique=False)
    op.create_index(op.f('ix_organization_memberships_user_id'), 'organization_memberships', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_organization_memberships_user_id'), table_name='organization_memberships')
    op.drop_index(op.f('ix_organization_memberships_organization_id'), table_name='organization_memberships')
    op.drop_table('organization_memberships')
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_organizations_clerk_org_id'), table_name='organizations')
    op.drop_table('organizations')
