"""
Deterministic simulated financial transaction provider for development and testing.
"""

from datetime import date, timedelta
from decimal import Decimal
from typing import List, Optional

from src.personal.providers.base import FinancialDataProvider, RawTransactionDTO


class SimulatedFinancialProvider(FinancialDataProvider):
    """
    Generates realistic, deterministic multi-month transaction feeds for common SaaS,
    streaming, cloud, and AI tools alongside sporadic one-off transactions.
    """

    def fetch_transactions(
        self,
        user_id: str,
        account_mask: str = "4821",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[RawTransactionDTO]:
        ref_date = end_date or date.today()
        transactions: List[RawTransactionDTO] = []

        # 1. Netflix Monthly ($15.49) - 4 consecutive months
        for i, offset in enumerate([90, 60, 30, 0]):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_nflx_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=Decimal("15.49"),
                    currency="USD",
                    raw_description="NETFLIX.COM 402938 PAYMENT SAN GATOS CA",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 2. OpenAI / ChatGPT Plus Monthly ($20.00) - 4 consecutive months
        for i, offset in enumerate([91, 61, 31, 1]):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_oai_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=Decimal("20.00"),
                    currency="USD",
                    raw_description="OPENAI *CHATGPT SUBSCRIPTION SAN FRANCISCO CA",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 3. Spotify Premium Monthly ($10.99) - 4 consecutive months
        for i, offset in enumerate([85, 55, 25, 0]):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_spt_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=Decimal("10.99"),
                    currency="USD",
                    raw_description="SPOTIFY*PREMIUM MONTHLY DIRECT DEBIT",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 4. GitHub Copilot Monthly ($10.00) - 4 consecutive months
        for i, offset in enumerate([88, 58, 28, 0]):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_gh_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=Decimal("10.00"),
                    currency="USD",
                    raw_description="GITHUB *COPILOT SUB GITHUB.COM SAN FRANCISCO",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 5. AWS Cloud Monthly (~$35.20 with slight variance) - 4 consecutive months
        aws_amounts = [Decimal("34.80"), Decimal("35.50"), Decimal("35.20"), Decimal("35.90")]
        for i, (offset, amt) in enumerate(zip([92, 62, 32, 2], aws_amounts)):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_aws_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=amt,
                    currency="USD",
                    raw_description="AWS EMEA AWS.AMAZON.CO WA",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 6. Canva Pro Monthly ($12.99) - 4 consecutive months
        for i, offset in enumerate([95, 65, 35, 5]):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_cnv_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=Decimal("12.99"),
                    currency="USD",
                    raw_description="CANVA PRO MONTHLY SUBSCRIPTION SYDNEY",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 7. Amazon Prime Annual ($139.00) - 2 consecutive years
        for i, offset in enumerate([365, 0]):
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"sim_prm_{user_id[:8]}_{i}",
                    transaction_date=t_date,
                    amount=Decimal("139.00"),
                    currency="USD",
                    raw_description="AMZN DIGITAL*PRIME ANNUAL RENEWAL SEATTLE WA",
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # 8. Sporadic non-recurring transactions (should NOT be detected as subscriptions)
        one_offs = [
            ("sim_uber_1", 14, Decimal("24.50"), "UBER *TRIP RIDE NYC"),
            ("sim_sbux_1", 8, Decimal("6.75"), "STARBUCKS STORE #10492 SEATTLE"),
            ("sim_sbux_2", 3, Decimal("7.25"), "STARBUCKS STORE #10492 SEATTLE"),
            ("sim_abnb_1", 45, Decimal("320.00"), "AIRBNB *HM9821 RESERVATION SAN FRANCISCO"),
        ]
        for ext_id, offset, amt, desc in one_offs:
            t_date = ref_date - timedelta(days=offset)
            transactions.append(
                RawTransactionDTO(
                    external_txn_id=f"{ext_id}_{user_id[:8]}",
                    transaction_date=t_date,
                    amount=amt,
                    currency="USD",
                    raw_description=desc,
                    transaction_type="DEBIT",
                    account_mask=account_mask,
                )
            )

        # Sort chronologically
        transactions.sort(key=lambda x: x.transaction_date)
        return transactions
