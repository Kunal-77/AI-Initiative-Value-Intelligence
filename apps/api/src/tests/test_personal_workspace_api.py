import pytest
import uuid
from fastapi import status
from src.identity.models import User
from src.identity.service import IdentityService
from src.personal.models import Subscription, PaymentMethod, SubscriptionCategory


def test_personal_routes_unauthenticated_rejected(client):
    """Verify that unauthenticated requests to personal endpoints return 401."""
    response = client.get("/api/v1/personal/dashboard")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_personal_routes_reject_business_context(client, mock_clerk_verifier):
    """Verify that personal endpoints reject tokens containing an active org context."""
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_aaa",
        "email": "user_a@example.com",
        "name": "User A",
        "org_id": "org_bbb",  # Active org context
        "org_name": "Org B",
        "org_role": "org:member",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers = {"Authorization": "Bearer token_business"}
    response = client.get("/api/v1/personal/dashboard", headers=headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Operation permitted only in Personal Workspace context." in response.json()["detail"]


def test_personal_workspace_flow(client, db, mock_clerk_verifier):
    """Verify full Personal Workspace CRUD operations under personal token context."""
    # 1. Mock Personal Auth Context for User A
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_personal_a",
        "email": "user_a@personal.com",
        "name": "User A Personal",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    headers_a = {"Authorization": "Bearer token_a"}

    # Initialize categories in DB
    from src.personal.service import PersonalService
    categories = PersonalService.get_categories(db)
    cat_ai = next(c for c in categories if c.name == "AI_TOOL")
    cat_cloud = next(c for c in categories if c.name == "CLOUD_SERVICE")

    # 2. Add Payment Method
    pm_data = {
        "type": "CREDIT_CARD",
        "card_brand": "Visa",
        "last_four": "1111",
        "expires_at": "2032-12-31"
    }
    response_pm = client.post("/api/v1/personal/payment-methods", json=pm_data, headers=headers_a)
    assert response_pm.status_code == status.HTTP_201_CREATED
    pm_id = response_pm.json()["id"]

    # 3. Add Generic Subscription
    sub_data = {
        "name": "Personal ChatGPT Plus",
        "cost_amount": 20.00,
        "currency_code": "USD",
        "billing_cycle": "MONTHLY",
        "category_id": str(cat_ai.id),
        "payment_method_id": pm_id,
        "subscription_type": "ai",
        "provider": "OpenAI",
        "model_plan": "ChatGPT Plus",
        "seat_count": 1
    }
    response_sub = client.post("/api/v1/personal/subscriptions", json=sub_data, headers=headers_a)
    assert response_sub.status_code == status.HTTP_201_CREATED
    sub_id = response_sub.json()["id"]
    assert response_sub.json()["provider"] == "OpenAI"

    # 4. Fetch Subscriptions List
    response_list = client.get("/api/v1/personal/subscriptions", headers=headers_a)
    assert response_list.status_code == 200
    assert len(response_list.json()) == 1
    assert response_list.json()[0]["name"] == "Personal ChatGPT Plus"

    # 5. Add Cloud Subscription
    cloud_sub_data = {
        "name": "Personal AWS Sandbox",
        "cost_amount": 120.00,
        "currency_code": "USD",
        "billing_cycle": "ANNUAL",
        "category_id": str(cat_cloud.id),
        "payment_method_id": None,
        "subscription_type": "cloud",
        "provider": "AWS",
        "account_identifier": "112233445566",
        "region": "us-west-2",
        "project_identifier": "sandbox-a"
    }
    response_cloud = client.post("/api/v1/personal/subscriptions", json=cloud_sub_data, headers=headers_a)
    assert response_cloud.status_code == status.HTTP_201_CREATED
    cloud_id = response_cloud.json()["id"]

    # 6. Fetch Dashboard Metrics
    response_dash = client.get("/api/v1/personal/dashboard", headers=headers_a)
    assert response_dash.status_code == 200
    dash = response_dash.json()
    # Spend breakdown: ChatGPT Plus (20.00 MONTHLY) + AWS Sandbox (120.00 ANNUAL / 12 = 10.00 MONTHLY) = 30.00 total spend
    assert float(dash["monthly_spend"]) == 30.00
    assert float(dash["ai_spend"]) == 20.00
    assert dash["active_subscriptions_count"] == 2
    assert dash["cloud_projects_count"] == 1

    # 7. Log AI Usage Record
    usage_data = {
        "subscription_id": sub_id,
        "usage_date": "2026-08-14",
        "quantity": 1000,
        "unit": "Queries",
        "cost": 5.50
    }
    response_use = client.post("/api/v1/personal/usage", json=usage_data, headers=headers_a)
    assert response_use.status_code == status.HTTP_201_CREATED

    # Verify usage in dashboard
    response_dash_new = client.get("/api/v1/personal/dashboard", headers=headers_a)
    assert len(response_dash_new.json()["recent_usage"]) == 1
    assert float(response_dash_new.json()["recent_usage"][0]["cost"]) == 5.50

    # 8. Verify Tenant Isolation (User B cannot access User A's data)
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_personal_b",
        "email": "user_b@personal.com",
        "name": "User B Personal",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    headers_b = {"Authorization": "Bearer token_b"}

    # User B list must be empty
    response_list_b = client.get("/api/v1/personal/subscriptions", headers=headers_b)
    assert len(response_list_b.json()) == 0

    # User B attempting to delete User A's subscription must fail with 404
    response_del_b = client.delete(f"/api/v1/personal/subscriptions/{sub_id}", headers=headers_b)
    assert response_del_b.status_code == status.HTTP_404_NOT_FOUND

    # 9. Clean up (User A deletes their own subscription)
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_personal_a",
        "email": "user_a@personal.com",
        "name": "User A Personal",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    response_del_a = client.delete(f"/api/v1/personal/subscriptions/{sub_id}", headers=headers_a)
    assert response_del_a.status_code == 200

    # Verification schedule and state cancellation should reflect in list
    response_list_final = client.get("/api/v1/personal/subscriptions", headers=headers_a)
    # Generic ChatGPT Plus has status CANCELLED, so only Cloud AWS Sandbox (1) remains active in list
    assert len(response_list_final.json()) == 1
