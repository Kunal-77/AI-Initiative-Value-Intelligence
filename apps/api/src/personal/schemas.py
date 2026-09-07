import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class SubscriptionCategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class PaymentMethodCreate(BaseModel):
    type: str  # CREDIT_CARD, BANK_ACCOUNT, PAYPAL
    card_brand: Optional[str] = None
    last_four: Optional[str] = None
    expires_at: Optional[date] = None


class PaymentMethodResponse(BaseModel):
    id: uuid.UUID
    type: str
    card_brand: Optional[str] = None
    last_four: Optional[str] = None
    expires_at: Optional[date] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class SubscriptionCreate(BaseModel):
    name: str
    cost_amount: Decimal
    currency_code: str = "USD"
    billing_cycle: str = "MONTHLY"  # MONTHLY, ANNUAL
    category_id: uuid.UUID
    payment_method_id: Optional[uuid.UUID] = None
    subscription_type: str = "generic"  # generic, cloud, ai
    status: str = "ACTIVE"
    trial_ends_at: Optional[datetime] = None

    # Cloud specific fields
    provider: Optional[str] = None
    account_identifier: Optional[str] = None
    region: Optional[str] = None
    project_identifier: Optional[str] = None

    # AI specific fields
    model_plan: Optional[str] = None
    seat_count: Optional[int] = 1


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    name: str
    cost_amount: Decimal
    currency_code: str
    billing_cycle: str
    status: str
    trial_ends_at: Optional[datetime] = None
    payment_method_id: Optional[uuid.UUID] = None
    subscription_type: str
    category_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    cancelled_at: Optional[datetime] = None

    # Loaded relationships
    category: Optional[SubscriptionCategoryResponse] = None
    payment_method: Optional[PaymentMethodResponse] = None

    # Polymorphic subclass fields
    provider: Optional[str] = None
    account_identifier: Optional[str] = None
    region: Optional[str] = None
    project_identifier: Optional[str] = None
    model_plan: Optional[str] = None
    seat_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class UsageRecordCreate(BaseModel):
    subscription_id: uuid.UUID
    usage_date: date
    quantity: Decimal
    unit: str
    cost: Decimal
    currency_code: str = "USD"


class UsageRecordResponse(BaseModel):
    id: uuid.UUID
    subscription_id: uuid.UUID
    usage_date: date
    quantity: Decimal
    unit: str
    cost: Decimal
    currency_code: str

    model_config = ConfigDict(from_attributes=True)


class RenewalScheduleResponse(BaseModel):
    id: uuid.UUID
    subscription_id: uuid.UUID
    renewal_date: date
    reminder_days_before: int
    auto_renew: bool
    notification_status: str

    model_config = ConfigDict(from_attributes=True)


class PersonalDashboardResponse(BaseModel):
    monthly_spend: Decimal
    ai_spend: Decimal
    active_subscriptions_count: int
    cloud_projects_count: int
    upcoming_renewals: List[RenewalScheduleResponse] = []
    recent_usage: List[UsageRecordResponse] = []


class BankConnectionCreate(BaseModel):
    provider: str = "SIMULATED"
    institution_name: str = "Sandbox Demo Bank"
    account_mask: str = "4821"
    account_type: str = "CHECKING"


class BankConnectionResponse(BaseModel):
    id: uuid.UUID
    provider: str
    institution_name: str
    account_mask: str
    account_type: str
    status: str
    consent_status: str
    last_synced_at: Optional[datetime] = None
    transaction_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BankTransactionResponse(BaseModel):
    id: uuid.UUID
    bank_connection_id: uuid.UUID
    transaction_date: date
    amount: Decimal
    currency: str
    raw_description: str
    normalized_merchant: Optional[str] = None
    transaction_type: str
    fingerprint: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionCandidateResponse(BaseModel):
    id: uuid.UUID
    merchant_name: str
    category: str
    amount: Decimal
    currency: str
    billing_frequency: str
    confidence_score: int
    detected_from: str
    first_transaction_date: date
    last_transaction_date: date
    next_expected_date: Optional[date] = None
    status: str
    converted_subscription_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BankSyncResponse(BaseModel):
    status: str
    message: str
    new_transactions: int
    candidates_detected: int
    connection: BankConnectionResponse

