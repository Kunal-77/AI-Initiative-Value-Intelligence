"""add initiative metadata fields

Revision ID: f76e1a48c90b
Revises: b4aba2c2bfa1
Create Date: 2026-08-12 19:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f76e1a48c90b'
down_revision: Union[str, None] = 'b4aba2c2bfa1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('initiatives', sa.Column('owner', sa.String(length=255), nullable=True))
    op.add_column('initiatives', sa.Column('executive_sponsor', sa.String(length=255), nullable=True))
    op.add_column('initiatives', sa.Column('project_lead', sa.String(length=255), nullable=True))
    op.add_column('initiatives', sa.Column('target_metric_name', sa.String(length=255), nullable=True))
    op.add_column('initiatives', sa.Column('target_metric_value', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('initiatives', 'target_metric_value')
    op.drop_column('initiatives', 'target_metric_name')
    op.drop_column('initiatives', 'project_lead')
    op.drop_column('initiatives', 'executive_sponsor')
    op.drop_column('initiatives', 'owner')
