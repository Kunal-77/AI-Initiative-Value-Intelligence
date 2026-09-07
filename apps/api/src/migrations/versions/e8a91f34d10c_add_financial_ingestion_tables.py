"""add_financial_ingestion_tables

Revision ID: e8a91f34d10c
Revises: f76e1a48c90b
Create Date: 2026-09-02 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8a91f34d10c'
down_revision: Union[str, None] = '8ea6f8e71b2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create bank_connections table
    op.create_table(
        'bank_connections',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('institution_name', sa.String(length=100), nullable=False),
        sa.Column('account_mask', sa.String(length=4), nullable=False),
        sa.Column('account_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('consent_status', sa.String(length=50), nullable=False),
        sa.Column('last_synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_connections_user_id'), 'bank_connections', ['user_id'], unique=False)

    # 2. Create bank_transactions table
    op.create_table(
        'bank_transactions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('bank_connection_id', sa.Uuid(), nullable=False),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=4), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('raw_description', sa.Text(), nullable=False),
        sa.Column('normalized_merchant', sa.String(length=150), nullable=True),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('fingerprint', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['bank_connection_id'], ['bank_connections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'fingerprint', name='uq_user_txn_fingerprint')
    )
    op.create_index(op.f('ix_bank_transactions_bank_connection_id'), 'bank_transactions', ['bank_connection_id'], unique=False)
    op.create_index(op.f('ix_bank_transactions_fingerprint'), 'bank_transactions', ['fingerprint'], unique=False)
    op.create_index(op.f('ix_bank_transactions_normalized_merchant'), 'bank_transactions', ['normalized_merchant'], unique=False)
    op.create_index(op.f('ix_bank_transactions_transaction_date'), 'bank_transactions', ['transaction_date'], unique=False)
    op.create_index(op.f('ix_bank_transactions_user_id'), 'bank_transactions', ['user_id'], unique=False)

    # 3. Create subscription_candidates table
    op.create_table(
        'subscription_candidates',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('merchant_name', sa.String(length=150), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=4), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('billing_frequency', sa.String(length=50), nullable=False),
        sa.Column('confidence_score', sa.Integer(), nullable=False),
        sa.Column('detected_from', sa.String(length=50), nullable=False),
        sa.Column('first_transaction_date', sa.Date(), nullable=False),
        sa.Column('last_transaction_date', sa.Date(), nullable=False),
        sa.Column('next_expected_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('converted_subscription_id', sa.Uuid(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['converted_subscription_id'], ['subscriptions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'merchant_name', 'billing_frequency', name='uq_user_merchant_candidate')
    )
    op.create_index(op.f('ix_subscription_candidates_status'), 'subscription_candidates', ['status'], unique=False)
    op.create_index(op.f('ix_subscription_candidates_user_id'), 'subscription_candidates', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_subscription_candidates_user_id'), table_name='subscription_candidates')
    op.drop_index(op.f('ix_subscription_candidates_status'), table_name='subscription_candidates')
    op.drop_table('subscription_candidates')

    op.drop_index(op.f('ix_bank_transactions_user_id'), table_name='bank_transactions')
    op.drop_index(op.f('ix_bank_transactions_transaction_date'), table_name='bank_transactions')
    op.drop_index(op.f('ix_bank_transactions_normalized_merchant'), table_name='bank_transactions')
    op.drop_index(op.f('ix_bank_transactions_fingerprint'), table_name='bank_transactions')
    op.drop_index(op.f('ix_bank_transactions_bank_connection_id'), table_name='bank_transactions')
    op.drop_table('bank_transactions')

    op.drop_index(op.f('ix_bank_connections_user_id'), table_name='bank_connections')
    op.drop_table('bank_connections')
