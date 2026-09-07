"""
Financial ingestion service with merchant normalization, deterministic deduplication,
cadence detection, and candidate lifecycle management.
"""

import hashlib
import re
import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from src.personal.models import (
    BankConnection,
    BankTransaction,
    SubscriptionCandidate,
    Subscription,
    SubscriptionCategory,
)
from src.personal.providers.base import FinancialDataProvider, RawTransactionDTO
from src.personal.providers.simulated import SimulatedFinancialProvider
from src.personal.schemas import SubscriptionCreate
from src.personal.service import PersonalService


class MerchantNormalizer:
    """
    Lightweight deterministic merchant normalizer using regex and alias mapping.
    """

    KNOWN_MERCHANTS: List[Tuple[re.Pattern, str, str, str]] = [
        (re.compile(r"openai|chatgpt", re.IGNORECASE), "ChatGPT Plus", "AI_TOOL", "ai"),
        (re.compile(r"claude|anthropic", re.IGNORECASE), "Claude Pro", "AI_TOOL", "ai"),
        (re.compile(r"github.*copilot|copilot", re.IGNORECASE), "GitHub Copilot", "PRODUCTIVITY", "ai"),
        (re.compile(r"netflix", re.IGNORECASE), "Netflix", "ENTERTAINMENT", "generic"),
        (re.compile(r"spotify", re.IGNORECASE), "Spotify Premium", "MUSIC", "generic"),
        (re.compile(r"youtube.*premium", re.IGNORECASE), "YouTube Premium", "ENTERTAINMENT", "generic"),
        (re.compile(r"aws|amazon\s*web\s*services", re.IGNORECASE), "AWS Cloud", "CLOUD_SERVICE", "cloud"),
        (re.compile(r"google\s*cloud|gcp", re.IGNORECASE), "Google Cloud", "CLOUD_SERVICE", "cloud"),
        (re.compile(r"azure|microsoft\s*azure", re.IGNORECASE), "Microsoft Azure", "CLOUD_SERVICE", "cloud"),
        (re.compile(r"canva", re.IGNORECASE), "Canva Pro", "PRODUCTIVITY", "generic"),
        (re.compile(r"prime|amazon\s*prime", re.IGNORECASE), "Amazon Prime", "ENTERTAINMENT", "generic"),
        (re.compile(r"notion", re.IGNORECASE), "Notion Plus", "PRODUCTIVITY", "generic"),
        (re.compile(r"slack", re.IGNORECASE), "Slack Pro", "PRODUCTIVITY", "generic"),
        (re.compile(r"figma", re.IGNORECASE), "Figma Professional", "PRODUCTIVITY", "generic"),
    ]

    @classmethod
    def normalize(cls, raw_desc: str) -> Tuple[str, str, str]:
        """
        Returns (normalized_merchant_name, category_name, subscription_type)
        """
        desc_clean = raw_desc.strip()

        for pattern, name, category, sub_type in cls.KNOWN_MERCHANTS:
            if pattern.search(desc_clean):
                return name, category, sub_type

        # Fallback cleaning: strip noise characters and common prefixes
        cleaned = re.sub(r"^(UPI[-/]|POS\s+|ACH\s+|NEFT[-/]|IMPS[-/]|DIRECT\s+DEBIT\s+)", "", desc_clean, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b(SAN FRANCISCO|SEATTLE|MUMBAI|NYC|CA|WA|SYDNEY|STOCKHOLM)\b", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"[*#\-_/]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        fallback_name = cleaned.title() if cleaned else "Recurring Service"
        return fallback_name[:150], "OTHER", "generic"


class IngestionService:
    """
    Ingestion orchestrator, deduplication, and recurring detection engine.
    """

    @staticmethod
    def calculate_fingerprint(user_id: uuid.UUID, account_mask: str, txn: RawTransactionDTO) -> str:
        """
        Generate deterministic SHA-256 fingerprint for deduplication.
        """
        content = f"{user_id}:{account_mask}:{txn.transaction_date.isoformat()}:{Decimal(str(txn.amount)):.2f}:{txn.raw_description.strip()}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def sync_connection(
        db: Session,
        user_id: uuid.UUID,
        connection_id: uuid.UUID,
        provider: Optional[FinancialDataProvider] = None,
    ) -> Tuple[int, int]:
        """
        Ingest transactions for connection and run recurring cadence detection.
        Returns (new_transactions_count, candidates_count).
        """
        # Strict user ownership verification
        stmt_conn = select(BankConnection).where(
            and_(BankConnection.id == connection_id, BankConnection.user_id == user_id)
        )
        connection = db.scalars(stmt_conn).first()
        if not connection:
            raise ValueError("Bank connection not found or unauthorized.")

        connection.status = "SYNCING"
        db.commit()

        try:
            # 1. Fetch transactions from provider
            active_provider = provider or SimulatedFinancialProvider()
            raw_txns = active_provider.fetch_transactions(
                user_id=str(user_id),
                account_mask=connection.account_mask,
            )

            # 2. Query existing fingerprints for this user to deduplicate
            stmt_existing = select(BankTransaction.fingerprint).where(BankTransaction.user_id == user_id)
            existing_fingerprints = set(db.scalars(stmt_existing).all())

            new_transactions = []
            for raw in raw_txns:
                fp = IngestionService.calculate_fingerprint(user_id, connection.account_mask, raw)
                if fp in existing_fingerprints:
                    continue  # Idempotent skip

                norm_merchant, _, _ = MerchantNormalizer.normalize(raw.raw_description)

                txn_record = BankTransaction(
                    user_id=user_id,
                    bank_connection_id=connection_id,
                    transaction_date=raw.transaction_date,
                    amount=raw.amount,
                    currency=raw.currency,
                    raw_description=raw.raw_description,
                    normalized_merchant=norm_merchant,
                    transaction_type=raw.transaction_type,
                    fingerprint=fp,
                )
                db.add(txn_record)
                existing_fingerprints.add(fp)
                new_transactions.append(txn_record)

            db.flush()

            # 3. Run cadence detection over all user transactions
            candidates_count = IngestionService.detect_recurring_candidates(db, user_id)

            # 4. Update connection state to SYNCED
            connection.status = "SYNCED"
            connection.last_synced_at = datetime.now(timezone.utc)
            db.commit()

            return len(new_transactions), candidates_count

        except Exception as e:
            connection.status = "ERROR"
            db.commit()
            raise e

    @staticmethod
    def detect_recurring_candidates(db: Session, user_id: uuid.UUID) -> int:
        """
        Deterministic cadence clustering over user's bank transactions.
        Identifies monthly (27-33d) and annual (330-400d) repeating debits.
        """
        stmt = (
            select(BankTransaction)
            .where(
                and_(
                    BankTransaction.user_id == user_id,
                    BankTransaction.transaction_type == "DEBIT",
                )
            )
            .order_by(BankTransaction.transaction_date.asc())
        )
        transactions = list(db.scalars(stmt).all())

        # Group by normalized merchant
        clusters: Dict[str, List[BankTransaction]] = {}
        for txn in transactions:
            merchant = txn.normalized_merchant or "Unknown Merchant"
            if merchant not in clusters:
                clusters[merchant] = []
            clusters[merchant].append(txn)

        detected_count = 0

        for merchant, txns in clusters.items():
            if len(txns) < 2:
                continue

            # Check intervals
            intervals: List[int] = []
            for i in range(1, len(txns)):
                delta = (txns[i].transaction_date - txns[i - 1].transaction_date).days
                intervals.append(delta)

            is_monthly = False
            is_annual = False
            frequency = "MONTHLY"
            confidence = 0

            # Monthly check: at least 2 interval steps (3 transactions) mostly in [27, 33] days
            monthly_matches = [d for d in intervals if 27 <= d <= 33]
            if len(monthly_matches) >= 2 and len(txns) >= 3:
                is_monthly = True
                frequency = "MONTHLY"
                # Base 60 + 10 per occurrence (max 98)
                confidence = min(98, 60 + (len(txns) * 10))
            # Annual check: at least 1 interval step in [330, 400] days (2 transactions)
            elif any(330 <= d <= 400 for d in intervals) and len(txns) >= 2:
                is_annual = True
                frequency = "ANNUAL"
                confidence = min(95, 75 + (len(txns) * 10))

            if not (is_monthly or is_annual):
                continue

            # Determine cost (use latest transaction amount)
            latest_txn = txns[-1]
            first_txn = txns[0]
            cost_amount = latest_txn.amount
            currency = latest_txn.currency

            _, category_name, _ = MerchantNormalizer.normalize(latest_txn.raw_description)

            next_date = latest_txn.transaction_date + timedelta(days=365 if frequency == "ANNUAL" else 30)

            # Idempotency check: check if candidate already exists
            stmt_cand = select(SubscriptionCandidate).where(
                and_(
                    SubscriptionCandidate.user_id == user_id,
                    SubscriptionCandidate.merchant_name == merchant,
                    SubscriptionCandidate.billing_frequency == frequency,
                )
            )
            candidate = db.scalars(stmt_cand).first()

            if candidate:
                if candidate.status == "PENDING":
                    # Update existing pending candidate with refreshed values
                    candidate.amount = cost_amount
                    candidate.category = category_name
                    candidate.confidence_score = confidence
                    candidate.last_transaction_date = latest_txn.transaction_date
                    candidate.next_expected_date = next_date
                # If candidate is already CONFIRMED or DISMISSED, preserve status
            else:
                # Insert new candidate
                new_candidate = SubscriptionCandidate(
                    user_id=user_id,
                    merchant_name=merchant,
                    category=category_name,
                    amount=cost_amount,
                    currency=currency,
                    billing_frequency=frequency,
                    confidence_score=confidence,
                    detected_from="SIMULATED_FEED",
                    first_transaction_date=first_txn.transaction_date,
                    last_transaction_date=latest_txn.transaction_date,
                    next_expected_date=next_date,
                    status="PENDING",
                )
                db.add(new_candidate)
                detected_count += 1

        db.flush()
        return detected_count

    @staticmethod
    def confirm_candidate(db: Session, user_id: uuid.UUID, candidate_id: uuid.UUID) -> Subscription:
        """
        Converts a detected SubscriptionCandidate into a real active Subscription.
        Includes duplicate subscription protection to ensure no duplicates are created.
        """
        stmt_cand = select(SubscriptionCandidate).where(
            and_(
                SubscriptionCandidate.id == candidate_id,
                SubscriptionCandidate.user_id == user_id,
            )
        )
        candidate = db.scalars(stmt_cand).first()
        if not candidate:
            raise ValueError("Subscription candidate not found or unauthorized.")

        if candidate.status == "CONFIRMED" and candidate.converted_subscription_id:
            # Already confirmed: return linked subscription
            stmt_sub = select(Subscription).where(
                and_(Subscription.id == candidate.converted_subscription_id, Subscription.user_id == user_id)
            )
            existing_sub = db.scalars(stmt_sub).first()
            if existing_sub:
                return existing_sub

        # 1. DUPLICATE SUBSCRIPTION PROTECTION
        # Check if user already has an active subscription matching this merchant & cycle
        stmt_active_subs = select(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                Subscription.status != "CANCELLED",
            )
        )
        active_subs = list(db.scalars(stmt_active_subs).all())

        cand_name_norm = candidate.merchant_name.lower().strip()
        matched_existing: Optional[Subscription] = None

        for sub in active_subs:
            sub_name_norm = sub.name.lower().strip()
            if (cand_name_norm in sub_name_norm or sub_name_norm in cand_name_norm) and sub.billing_cycle == candidate.billing_frequency:
                matched_existing = sub
                break

        if matched_existing:
            # Link candidate to existing subscription without creating duplicate
            candidate.status = "CONFIRMED"
            candidate.converted_subscription_id = matched_existing.id
            db.commit()
            return matched_existing

        # 2. Resolve category ID
        PersonalService.get_or_create_default_categories(db)
        stmt_cat = select(SubscriptionCategory).where(SubscriptionCategory.name == candidate.category)
        cat = db.scalars(stmt_cat).first()
        if not cat:
            # Fallback to OTHER or first category
            stmt_fallback = select(SubscriptionCategory).order_by(SubscriptionCategory.name)
            cat = db.scalars(stmt_fallback).first()

        category_id = cat.id if cat else uuid.uuid4()

        # 3. Determine polymorphic type
        _, _, sub_type = MerchantNormalizer.normalize(candidate.merchant_name)

        create_data = SubscriptionCreate(
            name=candidate.merchant_name,
            cost_amount=candidate.amount,
            currency_code=candidate.currency,
            billing_cycle=candidate.billing_frequency,
            category_id=category_id,
            subscription_type=sub_type,
            status="ACTIVE",
            provider=candidate.merchant_name if sub_type in ("cloud", "ai") else None,
            model_plan="Standard Subscription" if sub_type == "ai" else None,
            account_identifier=f"acc_{str(user_id)[:6]}" if sub_type == "cloud" else None,
        )

        # 4. Call existing PersonalService.create_subscription()
        # This auto-generates the renewal schedule through the canonical service flow
        new_subscription = PersonalService.create_subscription(db, user_id, create_data)

        # 5. Mark candidate confirmed and link ID
        candidate.status = "CONFIRMED"
        candidate.converted_subscription_id = new_subscription.id
        db.commit()

        return new_subscription

    @staticmethod
    def dismiss_candidate(db: Session, user_id: uuid.UUID, candidate_id: uuid.UUID) -> bool:
        """
        Marks a candidate as DISMISSED so it is no longer shown as pending.
        """
        stmt_cand = select(SubscriptionCandidate).where(
            and_(
                SubscriptionCandidate.id == candidate_id,
                SubscriptionCandidate.user_id == user_id,
            )
        )
        candidate = db.scalars(stmt_cand).first()
        if not candidate:
            return False

        candidate.status = "DISMISSED"
        db.commit()
        return True
