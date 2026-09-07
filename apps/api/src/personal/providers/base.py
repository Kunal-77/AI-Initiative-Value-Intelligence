"""
Base provider abstraction for financial transaction feeds.
"""

from abc import ABC, abstractmethod
from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class RawTransactionDTO(BaseModel):
    """
    Standardized Data Transfer Object for raw ingested transactions.
    """
    external_txn_id: str
    transaction_date: date
    amount: Decimal
    currency: str = "USD"
    raw_description: str
    transaction_type: str = "DEBIT"
    account_mask: str = "4821"


class FinancialDataProvider(ABC):
    """
    Interface representing a financial data aggregator or statement feed.
    """
    @abstractmethod
    def fetch_transactions(
        self,
        user_id: str,
        account_mask: str = "4821",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[RawTransactionDTO]:
        """
        Retrieve transaction records from provider.
        """
        pass
