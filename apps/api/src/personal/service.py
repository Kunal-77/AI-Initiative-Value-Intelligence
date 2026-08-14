import uuid
from decimal import Decimal
from datetime import date, datetime, timezone, timedelta
from sqlalchemy import select, delete, and_
from sqlalchemy.orm import Session
from typing import List, Optional

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
from src.personal.schemas import (
    SubscriptionCreate,
    PaymentMethodCreate,
    UsageRecordCreate,
)


class PersonalService:
    @staticmethod
    def get_or_create_default_categories(db: Session) -> List[SubscriptionCategory]:
        """
        Ensure default categories exist in the database and return them.
        """
        defaults = [
            ("AI_TOOL", "Generative AI subscription services"),
            ("CLOUD_SERVICE", "Cloud platform services and project sandboxes"),
            ("PRODUCTIVITY", "Productivity and collaboration tools"),
            ("ENTERTAINMENT", "Streaming, newsletters, and media"),
        ]
        
        categories = []
        for name, desc in defaults:
            stmt = select(SubscriptionCategory).where(SubscriptionCategory.name == name)
            cat = db.scalars(stmt).first()
            if not cat:
                cat = SubscriptionCategory(name=name, description=desc)
                db.add(cat)
                db.flush()
            categories.append(cat)
        db.commit()
        return categories

    @staticmethod
    def get_categories(db: Session) -> List[SubscriptionCategory]:
        """
        Fetch all subscription categories.
        """
        PersonalService.get_or_create_default_categories(db)
        stmt = select(SubscriptionCategory).order_by(SubscriptionCategory.name)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_subscriptions(db: Session, user_id: uuid.UUID) -> List[Subscription]:
        """
        Fetch all subscriptions for the user, loaded with polymorphic subclass properties.
        """
        stmt = select(Subscription).where(
            and_(Subscription.user_id == user_id, Subscription.status != "CANCELLED")
        ).order_by(Subscription.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_subscription(db: Session, user_id: uuid.UUID, data: SubscriptionCreate) -> Subscription:
        """
        Create a new subscription based on polymorphic type.
        """
        # Validate category_id exists
        stmt_cat = select(SubscriptionCategory).where(SubscriptionCategory.id == data.category_id)
        if not db.scalars(stmt_cat).first():
            raise ValueError("Invalid category ID.")

        # Validate payment_method_id if provided
        if data.payment_method_id:
            stmt_pay = select(PaymentMethod).where(
                and_(PaymentMethod.id == data.payment_method_id, PaymentMethod.user_id == user_id)
            )
            if not db.scalars(stmt_pay).first():
                raise ValueError("Invalid payment method ID.")

        sub = None
        if data.subscription_type == "cloud":
            if not data.provider or not data.account_identifier:
                raise ValueError("Cloud subscriptions require provider and account_identifier.")
            sub = CloudSubscription(
                user_id=user_id,
                category_id=data.category_id,
                name=data.name,
                cost_amount=data.cost_amount,
                currency_code=data.currency_code,
                billing_cycle=data.billing_cycle,
                status=data.status,
                trial_ends_at=data.trial_ends_at,
                payment_method_id=data.payment_method_id,
                provider=data.provider,
                account_identifier=data.account_identifier,
                region=data.region,
                project_identifier=data.project_identifier,
            )
        elif data.subscription_type == "ai":
            if not data.provider or not data.model_plan:
                raise ValueError("AI subscriptions require provider and model_plan.")
            sub = AISubscription(
                user_id=user_id,
                category_id=data.category_id,
                name=data.name,
                cost_amount=data.cost_amount,
                currency_code=data.currency_code,
                billing_cycle=data.billing_cycle,
                status=data.status,
                trial_ends_at=data.trial_ends_at,
                payment_method_id=data.payment_method_id,
                provider=data.provider,
                model_plan=data.model_plan,
                seat_count=data.seat_count or 1,
            )
        else:
            sub = Subscription(
                user_id=user_id,
                category_id=data.category_id,
                name=data.name,
                cost_amount=data.cost_amount,
                currency_code=data.currency_code,
                billing_cycle=data.billing_cycle,
                status=data.status,
                trial_ends_at=data.trial_ends_at,
                payment_method_id=data.payment_method_id,
            )

        db.add(sub)
        db.flush()

        # Auto-provision a renewal schedule based on billing cycle if active
        if sub.status == "ACTIVE":
            renewal_date = date.today() + (timedelta(days=365) if sub.billing_cycle == "ANNUAL" else timedelta(days=30))
            schedule = RenewalSchedule(
                subscription_id=sub.id,
                renewal_date=renewal_date,
                reminder_days_before=3,
                auto_renew=True,
                notification_status="PENDING",
            )
            db.add(schedule)

        db.commit()
        return sub

    @staticmethod
    def delete_subscription(db: Session, user_id: uuid.UUID, subscription_id: uuid.UUID) -> bool:
        """
        Strictly user-scoped deletion of a subscription.
        """
        stmt = select(Subscription).where(
            and_(Subscription.id == subscription_id, Subscription.user_id == user_id)
        )
        sub = db.scalars(stmt).first()
        if not sub:
            return False

        # Soft delete or hard delete: we can set status to CANCELLED and deleted cancelled_at
        sub.status = "CANCELLED"
        sub.cancelled_at = datetime.now(timezone.utc)
        
        # Clean up related renewal schedules
        stmt_del_sched = delete(RenewalSchedule).where(RenewalSchedule.subscription_id == subscription_id)
        db.execute(stmt_del_sched)
        
        db.commit()
        return True

    @staticmethod
    def get_payment_methods(db: Session, user_id: uuid.UUID) -> List[PaymentMethod]:
        """
        List active payment methods for the user.
        """
        stmt = select(PaymentMethod).where(
            and_(PaymentMethod.user_id == user_id, PaymentMethod.status == "ACTIVE")
        ).order_by(PaymentMethod.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_payment_method(db: Session, user_id: uuid.UUID, data: PaymentMethodCreate) -> PaymentMethod:
        """
        Add a payment method for the user.
        """
        pm = PaymentMethod(
            user_id=user_id,
            type=data.type,
            card_brand=data.card_brand,
            last_four=data.last_four,
            expires_at=data.expires_at,
            status="ACTIVE",
        )
        db.add(pm)
        db.commit()
        return pm

    @staticmethod
    def get_usage_records(db: Session, user_id: uuid.UUID) -> List[UsageRecord]:
        """
        List all usage records for the user's subscriptions.
        """
        stmt = select(UsageRecord).join(Subscription).where(
            Subscription.user_id == user_id
        ).order_by(UsageRecord.usage_date.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_usage_record(db: Session, user_id: uuid.UUID, data: UsageRecordCreate) -> UsageRecord:
        """
        Record subscription resource/API usage.
        """
        # Validate subscription is owned by user
        stmt_sub = select(Subscription).where(
            and_(Subscription.id == data.subscription_id, Subscription.user_id == user_id)
        )
        if not db.scalars(stmt_sub).first():
            raise ValueError("Invalid subscription ID.")

        ur = UsageRecord(
            subscription_id=data.subscription_id,
            usage_date=data.usage_date,
            quantity=data.quantity,
            unit=data.unit,
            cost=data.cost,
            currency_code=data.currency_code,
        )
        db.add(ur)
        db.commit()
        return ur

    @staticmethod
    def get_dashboard(db: Session, user_id: uuid.UUID):
        """
        Compute dashboard metrics:
        - Monthly Spend
        - AI Spend
        - Active Subscriptions count
        - Cloud projects count
        - List of upcoming renewal schedules (next 30 days)
        - List of recent usage records (last 30 days)
        """
        # Get active subscriptions
        subs = PersonalService.get_subscriptions(db, user_id)
        
        monthly_spend = Decimal("0.0")
        ai_spend = Decimal("0.0")
        active_subscriptions_count = 0
        cloud_projects_count = 0
        
        for sub in subs:
            if sub.status != "ACTIVE":
                continue
            
            # Map cost to monthly value
            cost = sub.cost_amount
            if sub.billing_cycle == "ANNUAL":
                monthly_val = cost / Decimal("12.0")
            else:
                monthly_val = cost
                
            monthly_spend += monthly_val
            active_subscriptions_count += 1
            
            if sub.subscription_type == "ai":
                ai_spend += monthly_val
            elif sub.subscription_type == "cloud":
                cloud_projects_count += 1

        # Upcoming renewals (next 30 days)
        today = date.today()
        end_date = today + timedelta(days=30)
        stmt_renew = select(RenewalSchedule).join(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                RenewalSchedule.renewal_date >= today,
                RenewalSchedule.renewal_date <= end_date
            )
        ).order_by(RenewalSchedule.renewal_date)
        renewals = list(db.scalars(stmt_renew).all())

        # Recent usage (last 30 days)
        start_date = today - timedelta(days=30)
        stmt_usage = select(UsageRecord).join(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                UsageRecord.usage_date >= start_date
            )
        ).order_by(UsageRecord.usage_date.desc())
        usage = list(db.scalars(stmt_usage).all())

        return {
            "monthly_spend": monthly_spend,
            "ai_spend": ai_spend,
            "active_subscriptions_count": active_subscriptions_count,
            "cloud_projects_count": cloud_projects_count,
            "upcoming_renewals": renewals,
            "recent_usage": usage,
        }
