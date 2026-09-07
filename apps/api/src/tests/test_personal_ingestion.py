"""
Comprehensive test suite for Personal Financial Ingestion, Cadence Detection, and Subscription Candidate confirmation.
"""

import pytest
import uuid
from decimal import Decimal
from fastapi import status
from sqlalchemy import select

from src.personal.models import (
    BankConnection,
    BankTransaction,
    SubscriptionCandidate,
    Subscription,
    RenewalSchedule,
)
from src.personal.service import PersonalService
from src.personal.ingestion_service import IngestionService, MerchantNormalizer


def test_merchant_normalizer():
    """Verify regex and keyword normalization mapping."""
    name, cat, stype = MerchantNormalizer.normalize("NETFLIX.COM 402938 SAN GATOS CA")
    assert name == "Netflix"
    assert cat == "ENTERTAINMENT"
    assert stype == "generic"

    name, cat, stype = MerchantNormalizer.normalize("OPENAI *CHATGPT SUBSCRIPTION SAN FRANCISCO")
    assert name == "ChatGPT Plus"
    assert cat == "AI_TOOL"
    assert stype == "ai"

    name, cat, stype = MerchantNormalizer.normalize("SPOTIFY*PREMIUM MONTHLY")
    assert name == "Spotify Premium"
    assert cat == "MUSIC"
    assert stype == "generic"

    name, cat, stype = MerchantNormalizer.normalize("GITHUB *COPILOT SUB")
    assert name == "GitHub Copilot"
    assert cat == "PRODUCTIVITY"
    assert stype == "ai"

    name, cat, stype = MerchantNormalizer.normalize("AWS EMEA AWS.AMAZON.CO WA")
    assert name == "AWS Cloud"
    assert cat == "CLOUD_SERVICE"
    assert stype == "cloud"


def test_full_financial_ingestion_e2e_pipeline(client, db, mock_clerk_verifier):
    """
    Test End-to-End Ingestion, Deduplication, Cadence Detection, Candidate Confirmation,
    and Duplicate Protection.
    """
    # 1. Mock Auth Context for User 1
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_ingest_test_1",
        "email": "ingest_user1@example.com",
        "name": "Ingest User 1",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0,
    }
    headers = {"Authorization": "Bearer test_token_ingest_1"}

    # 2. Create Bank Connection
    res_conn = client.post(
        "/api/v1/personal/bank-connections",
        json={
            "provider": "SIMULATED",
            "institution_name": "Sandbox Demo Bank",
            "account_mask": "4821",
            "account_type": "CHECKING",
        },
        headers=headers,
    )
    assert res_conn.status_code == status.HTTP_201_CREATED
    conn_data = res_conn.json()
    conn_id = conn_data["id"]
    assert conn_data["institution_name"] == "Sandbox Demo Bank"
    assert conn_data["status"] == "CONNECTED"

    # 3. First Sync -> Ingests transactions and runs cadence detection
    res_sync_1 = client.post(f"/api/v1/personal/bank-connections/{conn_id}/sync", headers=headers)
    assert res_sync_1.status_code == status.HTTP_200_OK
    sync_1_data = res_sync_1.json()
    new_txns_1 = sync_1_data["new_transactions"]
    candidates_1 = sync_1_data["candidates_detected"]

    assert new_txns_1 > 0, "Expected new transactions on first sync"
    assert candidates_1 > 0, "Expected candidates detected on first sync"

    # 4. Second Sync -> Idempotency check (0 new transactions, candidates not duplicated)
    res_sync_2 = client.post(f"/api/v1/personal/bank-connections/{conn_id}/sync", headers=headers)
    assert res_sync_2.status_code == status.HTTP_200_OK
    sync_2_data = res_sync_2.json()
    assert sync_2_data["new_transactions"] == 0, "Second sync must insert 0 duplicate transactions"

    # 5. Query Candidates endpoint
    res_cand = client.get("/api/v1/personal/candidates", headers=headers)
    assert res_cand.status_code == status.HTTP_200_OK
    candidates = res_cand.json()
    assert len(candidates) >= 4, "Expected multiple detected candidates"

    # Verify Netflix, ChatGPT, Spotify are present among candidates
    candidate_names = [c["merchant_name"] for c in candidates]
    assert "Netflix" in candidate_names
    assert "ChatGPT Plus" in candidate_names
    assert "Spotify Premium" in candidate_names

    # Check candidate properties
    nflx_cand = next(c for c in candidates if c["merchant_name"] == "Netflix")
    assert nflx_cand["confidence_score"] >= 85
    assert nflx_cand["billing_frequency"] == "MONTHLY"
    assert nflx_cand["status"] == "PENDING"
    assert Decimal(str(nflx_cand["amount"])) == Decimal("15.49")

    # 6. Confirm Candidate (Convert to Subscription)
    res_confirm = client.post(f"/api/v1/personal/candidates/{nflx_cand['id']}/confirm", headers=headers)
    assert res_confirm.status_code == status.HTTP_200_OK
    sub_data = res_confirm.json()
    assert sub_data["name"] == "Netflix"
    assert sub_data["status"] == "ACTIVE"
    assert Decimal(str(sub_data["cost_amount"])) == Decimal("15.49")

    # Verify renewal schedule was automatically provisioned in DB
    stmt_sched = select(RenewalSchedule).where(RenewalSchedule.subscription_id == uuid.UUID(sub_data["id"]))
    sched = db.scalars(stmt_sched).first()
    assert sched is not None, "Renewal schedule must be auto-created"
    assert sched.notification_status == "PENDING"

    # 7. Check that confirmed candidate is no longer in pending candidates list
    res_cand_after = client.get("/api/v1/personal/candidates", headers=headers)
    remaining_names = [c["merchant_name"] for c in res_cand_after.json()]
    assert "Netflix" not in remaining_names

    # 8. Duplicate Subscription Protection:
    # Repeat confirmation of the same candidate or equivalent subscription
    res_confirm_repeat = client.post(f"/api/v1/personal/candidates/{nflx_cand['id']}/confirm", headers=headers)
    assert res_confirm_repeat.status_code == status.HTTP_200_OK
    assert res_confirm_repeat.json()["id"] == sub_data["id"], "Must return existing subscription without creating duplicate"

    # Verify total subscription count in DB for user
    res_subs = client.get("/api/v1/personal/subscriptions", headers=headers)
    nflx_subs = [s for s in res_subs.json() if s["name"] == "Netflix"]
    assert len(nflx_subs) == 1, "Duplicate subscription protection must guarantee exactly 1 subscription"

    # 9. Test Candidate Dismissal
    spotify_cand = next(c for c in candidates if c["merchant_name"] == "Spotify Premium")
    res_dismiss = client.post(f"/api/v1/personal/candidates/{spotify_cand['id']}/dismiss", headers=headers)
    assert res_dismiss.status_code == status.HTTP_200_OK

    res_cand_dismiss = client.get("/api/v1/personal/candidates", headers=headers)
    remaining_after_dismiss = [c["merchant_name"] for c in res_cand_dismiss.json()]
    assert "Spotify Premium" not in remaining_after_dismiss


def test_financial_ingestion_user_isolation(client, db, mock_clerk_verifier):
    """
    Verify strict user isolation: User B cannot access or manipulate User A's connections or candidates.
    """
    # Create connection for User A
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_iso_a",
        "email": "iso_a@example.com",
        "name": "User Iso A",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0,
    }
    headers_a = {"Authorization": "Bearer token_iso_a"}

    res_conn_a = client.post(
        "/api/v1/personal/bank-connections",
        json={"provider": "SIMULATED", "institution_name": "User A Bank", "account_mask": "1111", "account_type": "CHECKING"},
        headers=headers_a,
    )
    conn_a_id = res_conn_a.json()["id"]

    # Sync User A
    client.post(f"/api/v1/personal/bank-connections/{conn_a_id}/sync", headers=headers_a)
    cands_a = client.get("/api/v1/personal/candidates", headers=headers_a).json()
    cand_a_id = cands_a[0]["id"]

    # Switch to User B
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_iso_b",
        "email": "iso_b@example.com",
        "name": "User Iso B",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0,
    }
    headers_b = {"Authorization": "Bearer token_iso_b"}

    # User B tries to sync User A's connection -> Must be 404
    res_b_sync = client.post(f"/api/v1/personal/bank-connections/{conn_a_id}/sync", headers=headers_b)
    assert res_b_sync.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to confirm User A's candidate -> Must be 404
    res_b_confirm = client.post(f"/api/v1/personal/candidates/{cand_a_id}/confirm", headers=headers_b)
    assert res_b_confirm.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to delete User A's connection -> Must be 404
    res_b_delete = client.delete(f"/api/v1/personal/bank-connections/{conn_a_id}", headers=headers_b)
    assert res_b_delete.status_code == status.HTTP_404_NOT_FOUND


def test_transactions_explorer_and_disconnect_cascade(client, db, mock_clerk_verifier):
    """
    Verify GET /api/v1/personal/transactions lists ingested transactions,
    enforces user isolation, and tests that disconnecting a bank connection cascades properly.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_txn_test",
        "email": "txn_user@example.com",
        "name": "Txn User",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0,
    }
    headers = {"Authorization": "Bearer token_txn_user"}

    # 1. Connect & Sync
    res_conn = client.post(
        "/api/v1/personal/bank-connections",
        json={"provider": "SIMULATED", "institution_name": "Demo Bank", "account_mask": "9999", "account_type": "CHECKING"},
        headers=headers,
    )
    conn_id = res_conn.json()["id"]
    client.post(f"/api/v1/personal/bank-connections/{conn_id}/sync", headers=headers)

    # 2. Fetch Transactions
    res_txns = client.get("/api/v1/personal/transactions", headers=headers)
    assert res_txns.status_code == status.HTTP_200_OK
    txns = res_txns.json()
    assert len(txns) > 0
    assert "amount" in txns[0]
    assert "raw_description" in txns[0]
    assert "transaction_date" in txns[0]

    # Verify transaction count on connection
    res_conns = client.get("/api/v1/personal/bank-connections", headers=headers)
    assert res_conns.status_code == 200
    assert res_conns.json()[0]["transaction_count"] == len(txns)

    # 3. User B cannot see User A's transactions
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_txn_b",
        "email": "txn_user_b@example.com",
        "name": "Txn User B",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0,
    }
    headers_b = {"Authorization": "Bearer token_txn_b"}
    res_txns_b = client.get("/api/v1/personal/transactions", headers=headers_b)
    assert res_txns_b.status_code == 200
    assert len(res_txns_b.json()) == 0

    # 4. Disconnect bank connection for User A
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_txn_test",
        "email": "txn_user@example.com",
        "name": "Txn User",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0,
    }
    res_del = client.delete(f"/api/v1/personal/bank-connections/{conn_id}", headers=headers)
    assert res_del.status_code == 200

    # Verify transactions and pending candidates are cleared
    res_txns_after = client.get("/api/v1/personal/transactions", headers=headers)
    assert len(res_txns_after.json()) == 0

    res_cands_after = client.get("/api/v1/personal/candidates", headers=headers)
    assert len(res_cands_after.json()) == 0
