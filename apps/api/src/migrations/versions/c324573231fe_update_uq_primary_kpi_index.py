"""update_uq_primary_kpi_index

Revision ID: c324573231fe
Revises: 57b553bdbd66
Create Date: 2026-07-30 19:02:33.217915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c324573231fe'
down_revision: Union[str, None] = '57b553bdbd66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index('uq_primary_kpi', table_name='initiative_metrics')
    op.create_index('uq_primary_kpi', 'initiative_metrics', ['initiative_id'], unique=True, postgresql_where="role = 'PRIMARY_KPI' AND status != 'SUPERSEDED'")


def downgrade() -> None:
    op.drop_index('uq_primary_kpi', table_name='initiative_metrics')
    op.create_index('uq_primary_kpi', 'initiative_metrics', ['initiative_id'], unique=True, postgresql_where="role = 'PRIMARY_KPI'")
