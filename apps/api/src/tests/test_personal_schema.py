import pytest
from datetime import datetime, date, timezone
from sqlalchemy.exc import IntegrityError
from src.identity.models import User
from src.personal.models import (
    SubscriptionCategory,
    PaymentMethod,
    Subscription,
    CloudSubscription,
    AISubscription,
    RecurringBill,
    RenewalSchedule,
    Receipt,
    UsageRecord,
)


def test_create_personal_workspace_models(db):
    """
    Verify successful creation and querying of all core Personal Workspace entities.
    """
    # 1. Create a user
    user = User(
        clerk_user_id="clerk_personal_user_1",
        display_name="John Doe",
        email_snapshot="john.doe@example.com",
        currency_code="USD",
    )
    db.add(user)
    db.commit()

    # 2. Create subscription categories
    cat_ai = SubscriptionCategory(name="AI_TOOL", description="Generative AI subscription services")
    cat_ent = SubscriptionCategory(name="ENTERTAINMENT", description="Streaming and media")
    db.add_all([cat_ai, cat_ent])
    db.commit()

    # 3. Create a payment method
    pay_method = PaymentMethod(
        user_id=user.id,
        type="CREDIT_CARD",
        card_brand="Visa",
        last_four="4242",
        expires_at=date(2030, 12, 31),
    )
    db.add(pay_method)
    db.commit()

    # 4. Create standard subscription
    sub_standard = Subscription(
        user_id=user.id,
        category_id=cat_ent.id,
        name="Netflix Pro",
        cost_amount=15.99,
        currency_code="USD",
        billing_cycle="MONTHLY",
        payment_method_id=pay_method.id,
    )
    db.add(sub_standard)
    db.commit()

    # 5. Create Cloud Subscription subclass (Polymorphic joined-table inheritance)
    sub_cloud = CloudSubscription(
        user_id=user.id,
        category_id=cat_ai.id,
        name="AWS Developer Sandbox",
        cost_amount=45.50,
        currency_code="USD",
        billing_cycle="MONTHLY",
        provider="AWS",
        account_identifier="123456789012",
        region="us-east-1",
        project_identifier="personal-dev",
    )
    db.add(sub_cloud)
    db.commit()

    # 6. Create AI Subscription subclass (Polymorphic joined-table inheritance)
    sub_ai = AISubscription(
        user_id=user.id,
        category_id=cat_ai.id,
        name="Claude Pro Team Account",
        cost_amount=20.00,
        currency_code="USD",
        billing_cycle="MONTHLY",
        provider="Anthropic",
        model_plan="Claude Pro",
        seat_count=1,
    )
    db.add(sub_ai)
    db.commit()

    # 7. Create Recurring Bill
    bill = RecurringBill(
        user_id=user.id,
        subscription_id=sub_standard.id,
        name="Electric Utility",
        amount=120.00,
        currency_code="USD",
        due_day=15,
        frequency="MONTHLY",
        payment_method_id=pay_method.id,
    )
    db.add(bill)
    db.commit()

    # 8. Create Renewal Schedule
    schedule = RenewalSchedule(
        subscription_id=sub_standard.id,
        renewal_date=date(2026, 9, 1),
        reminder_days_before=3,
        auto_renew=True,
    )
    db.add(schedule)
    db.commit()

    # 9. Create Receipt
    receipt = Receipt(
        subscription_id=sub_standard.id,
        recurring_bill_id=bill.id,
        amount=15.99,
        currency_code="USD",
        vendor_name="Netflix Inc.",
        payment_date=date(2026, 8, 1),
        storage_reference="s3://receipts/netflix_aug_2026.pdf",
        import_source="MANUAL",
    )
    db.add(receipt)
    db.commit()

    # 10. Create Usage Record
    usage = UsageRecord(
        subscription_id=sub_ai.id,
        usage_date=date(2026, 8, 2),
        quantity=150.00,
        unit="API_CALLS",
        cost=1.50,
        currency_code="USD",
    )
    db.add(usage)
    db.commit()

    # --- VERIFY RELATIONSHIPS & DATA ---
    # Query back all subscriptions and check polymorphic typing
    subs = db.query(Subscription).filter_by(user_id=user.id).all()
    assert len(subs) == 3

    types = {s.subscription_type for s in subs}
    assert "generic" in types
    assert "cloud" in types
    assert "ai" in types

    cloud_sub_queried = db.query(CloudSubscription).filter_by(id=sub_cloud.id).first()
    assert cloud_sub_queried is not None
    assert cloud_sub_queried.provider == "AWS"
    assert cloud_sub_queried.account_identifier == "123456789012"
    assert cloud_sub_queried.cost_amount == 45.50

    ai_sub_queried = db.query(AISubscription).filter_by(id=sub_ai.id).first()
    assert ai_sub_queried is not None
    assert ai_sub_queried.provider == "Anthropic"
    assert ai_sub_queried.model_plan == "Claude Pro"
    assert ai_sub_queried.seat_count == 1

    # Check category relationship
    assert sub_standard.category.name == "ENTERTAINMENT"
    # Check payment method relationship
    assert sub_standard.payment_method.card_brand == "Visa"
    # Check billing cycle and values
    assert bill.due_day == 15
    # Check schedule
    assert schedule.reminder_days_before == 3
    # Check receipt details
    assert receipt.storage_reference == "s3://receipts/netflix_aug_2026.pdf"
    # Check usage record relationship
    assert len(sub_ai.usage_records) == 1
    assert sub_ai.usage_records[0].unit == "API_CALLS"


def test_unique_constraints(db):
    """
    Verify unique constraint on Category Name.
    """
    cat1 = SubscriptionCategory(name="AI_TOOL", description="First")
    db.add(cat1)
    db.commit()

    cat2 = SubscriptionCategory(name="AI_TOOL", description="Second duplicate")
    db.add(cat2)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_restrict_category_deletion(db):
    """
    Verify that deleting a category containing active subscriptions is blocked by RESTRICT constraint.
    """
    user = User(clerk_user_id="clerk_personal_user_2")
    db.add(user)
    cat = SubscriptionCategory(name="PRODUCTIVITY")
    db.add(cat)
    db.commit()

    sub = Subscription(
        user_id=user.id,
        category_id=cat.id,
        name="Todoist Pro",
        cost_amount=4.00,
        currency_code="USD",
        billing_cycle="MONTHLY",
    )
    db.add(sub)
    db.commit()

    db.delete(cat)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_cascade_user_deletion(db):
    """
    Verify that deleting a User cascades to delete all their subscriptions, bills, and payment methods.
    """
    user = User(clerk_user_id="clerk_personal_user_3")
    db.add(user)
    cat = SubscriptionCategory(name="WORK")
    db.add(cat)
    db.commit()

    pay_method = PaymentMethod(user_id=user.id, type="PAYPAL")
    db.add(pay_method)
    db.commit()

    sub = Subscription(
        user_id=user.id,
        category_id=cat.id,
        name="Slack Pro",
        cost_amount=8.00,
        currency_code="USD",
        billing_cycle="MONTHLY",
        payment_method_id=pay_method.id,
    )
    db.add(sub)
    db.commit()

    # Store IDs before deletion
    sub_id = sub.id
    pay_method_id = pay_method.id

    # Perform user deletion
    db.delete(user)
    db.commit()

    # Assert cascaded deletes
    assert db.query(Subscription).filter_by(id=sub_id).first() is None
    assert db.query(PaymentMethod).filter_by(id=pay_method_id).first() is None
