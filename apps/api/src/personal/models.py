"""
Personal Workspace database models foundation.

This module contains database models and schemas specific to the Personal Workspace,
which focuses on user-centric asset and expense tracking (subscriptions, payment methods,
recurring bills, investments, savings goals, renewal calendars, usage-value records,
receipts, and AI insights).

Tenancy Isolation:
------------------
Unlike the organization-centric Business Workspace, the Personal Workspace isolates
data strictly to individual user accounts (authenticated via Clerk user IDs).
There are no shared organizational boundaries or multi-user roles in this scope.
"""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, DateTime, Date, Numeric, ForeignKey, Text, Boolean, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class SubscriptionCategory(Base):
    """
    Lookup table for categorizing subscriptions (e.g. ENTERTAINMENT, PRODUCTIVITY, AI_TOOL).
    """
    __tablename__ = "subscription_categories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Lifecycle metadata
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="category")


class PaymentMethod(Base):
    """
    Vault mapping of payment instruments (credit cards, bank accounts, PayPal).
    """
    __tablename__ = "payment_methods"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # CREDIT_CARD, BANK_ACCOUNT, PAYPAL
    provider_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    card_brand: Mapped[str | None] = mapped_column(String(50), nullable=True)
    last_four: Mapped[str | None] = mapped_column(String(4), nullable=True)
    expires_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Lifecycle metadata
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="payment_method")
    recurring_bills: Mapped[list["RecurringBill"]] = relationship(back_populates="payment_method")


class Subscription(Base):
    """
    Represents a recurring subscription service (SaaS, streaming, newsletter, memberships).
    """
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subscription_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    cost_amount: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)  # ISO 4217
    billing_cycle: Mapped[str] = mapped_column(String(50), nullable=False)  # MONTHLY, ANNUAL, etc.
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, PAUSED, TRIAL, CANCELLED
    trial_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_method_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True, index=True
    )
    subscription_type: Mapped[str] = mapped_column(String(50), default="generic", nullable=False)

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    category: Mapped["SubscriptionCategory"] = relationship(back_populates="subscriptions")
    payment_method: Mapped["PaymentMethod"] = relationship(back_populates="subscriptions")
    recurring_bills: Mapped[list["RecurringBill"]] = relationship(back_populates="subscription")
    renewal_schedules: Mapped[list["RenewalSchedule"]] = relationship(
        back_populates="subscription", cascade="all, delete-orphan"
    )
    receipts: Mapped[list["Receipt"]] = relationship(back_populates="subscription")
    usage_records: Mapped[list["UsageRecord"]] = relationship(
        back_populates="subscription", cascade="all, delete-orphan"
    )

    __mapper_args__ = {
        "polymorphic_on": "subscription_type",
        "polymorphic_identity": "generic",
    }


class CloudSubscription(Subscription):
    """
    Specialized extension mapping developer and personal sandbox cloud accounts.
    """
    __tablename__ = "cloud_subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"), primary_key=True
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # AWS, GCP, AZURE, etc.
    account_identifier: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    project_identifier: Mapped[str | None] = mapped_column(String(255), nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "cloud",
    }


class AISubscription(Subscription):
    """
    Extension mapping specific generative AI tools.
    """
    __tablename__ = "ai_subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"), primary_key=True
    )
    provider: Mapped[str] = mapped_column(String(100), nullable=False)  # OpenAI, Anthropic, etc.
    model_plan: Mapped[str] = mapped_column(String(100), nullable=False)
    seat_count: Mapped[int] = mapped_column(default=1, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "ai",
    }


class RecurringBill(Base):
    """
    Records recurring utility bills, rent, mobile bills, internet, or insurance premiums.
    """
    __tablename__ = "recurring_bills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subscription_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)  # ISO 4217
    due_day: Mapped[int] = mapped_column(nullable=False)  # Day of month (1-31)
    frequency: Mapped[str] = mapped_column(String(50), nullable=False)  # MONTHLY, ANNUAL, etc.
    payment_method_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Lifecycle metadata
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    subscription: Mapped[Subscription | None] = relationship(back_populates="recurring_bills")
    payment_method: Mapped[PaymentMethod | None] = relationship(back_populates="recurring_bills")
    receipts: Mapped[list["Receipt"]] = relationship(back_populates="recurring_bill")


class RenewalSchedule(Base):
    """
    Projections mapping subscription payment frequencies to upcoming dates.
    """
    __tablename__ = "renewal_schedules"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    renewal_date: Mapped[date] = mapped_column(Date, nullable=False)
    reminder_days_before: Mapped[int] = mapped_column(default=3, nullable=False)
    auto_renew: Mapped[bool] = mapped_column(default=True, nullable=False)
    notification_status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    subscription: Mapped[Subscription] = relationship(back_populates="renewal_schedules")


class Receipt(Base):
    """
    Represents a single transaction billing record or invoice receipt.
    """
    __tablename__ = "receipts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    subscription_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    recurring_bill_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("recurring_bills.id", ondelete="SET NULL"), nullable=True, index=True
    )
    amount: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)  # ISO 4217
    vendor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    storage_reference: Mapped[str | None] = mapped_column(String(512), nullable=True)
    import_source: Mapped[str] = mapped_column(String(50), default="MANUAL", nullable=False)

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    subscription: Mapped[Subscription | None] = relationship(back_populates="receipts")
    recurring_bill: Mapped[RecurringBill | None] = relationship(back_populates="receipts")


class UsageRecord(Base):
    """
    Tracks user usage quantities of a subscription to calculate value metrics.
    """
    __tablename__ = "usage_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    usage_date: Mapped[date] = mapped_column(Date, nullable=False)
    quantity: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    cost: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)  # ISO 4217

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    subscription: Mapped[Subscription] = relationship(back_populates="usage_records")


class BankConnection(Base):
    """
    Represents a linked financial institution account or simulated sandbox feed.
    """
    __tablename__ = "bank_connections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(50), default="SIMULATED", nullable=False)
    institution_name: Mapped[str] = mapped_column(String(100), default="Sandbox Demo Bank", nullable=False)
    account_mask: Mapped[str] = mapped_column(String(4), default="4821", nullable=False)
    account_type: Mapped[str] = mapped_column(String(50), default="CHECKING", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="CONNECTED", nullable=False)  # NOT_CONNECTED, CONNECTED, SYNCING, SYNCED, ERROR, EXPIRED
    consent_status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, PENDING, EXPIRED, REVOKED
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    transactions: Mapped[list["BankTransaction"]] = relationship(
        back_populates="bank_connection", cascade="all, delete-orphan"
    )

    @property
    def transaction_count(self) -> int:
        return len(self.transactions) if self.transactions else 0


class BankTransaction(Base):
    """
    Raw ingested financial transaction with SHA-256 fingerprint deduplication.
    """
    __tablename__ = "bank_transactions"
    __table_args__ = (
        UniqueConstraint("user_id", "fingerprint", name="uq_user_txn_fingerprint"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    bank_connection_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("bank_connections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    amount: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    raw_description: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_merchant: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    transaction_type: Mapped[str] = mapped_column(String(50), default="DEBIT", nullable=False)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    bank_connection: Mapped["BankConnection"] = relationship(back_populates="transactions")


class SubscriptionCandidate(Base):
    """
    Recurring payment detected by cadence engine, staged for explicit user confirmation.
    """
    __tablename__ = "subscription_candidates"
    __table_args__ = (
        UniqueConstraint("user_id", "merchant_name", "billing_frequency", name="uq_user_merchant_candidate"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    merchant_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="OTHER", nullable=False)
    amount: Mapped[Numeric] = mapped_column(Numeric(12, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    billing_frequency: Mapped[str] = mapped_column(String(50), default="MONTHLY", nullable=False)
    confidence_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    detected_from: Mapped[str] = mapped_column(String(50), default="SIMULATED_FEED", nullable=False)
    first_transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    last_transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    next_expected_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False, index=True)  # PENDING, CONFIRMED, DISMISSED
    converted_subscription_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True
    )

    # Lifecycle metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

