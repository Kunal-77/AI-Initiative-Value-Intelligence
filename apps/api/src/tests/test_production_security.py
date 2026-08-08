import pytest
import uuid
from fastapi import status
from src.identity.models import User, Organization
from src.identity.service import IdentityService
from src.initiatives.service import InitiativesService

def test_unauthenticated_request_rejected(client):
    """Verify that unauthenticated requests to protected endpoints are rejected with 401."""
    response = client.get("/api/v1/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Authentication token is missing." in response.json()["detail"]

def test_personal_workspace_health_check(client, mock_clerk_verifier):
    """Verify that authenticated personal workspace (no org context) works on personal test route."""
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_personal_123",
        "email": "personal_user@example.com",
        "name": "Personal User",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers = {"Authorization": "Bearer personal_token"}
    response = client.get("/api/v1/personal-test", headers=headers)
    assert response.status_code == 200
    assert response.json()["workspace_type"] == "personal"

def test_organization_workspace_context(client, mock_clerk_verifier):
    """Verify that organization context resolves correctly in get_me endpoint."""
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_org_123",
        "email": "org_user@example.com",
        "name": "Org User",
        "org_id": "org_clerk_aaa",
        "org_name": "Org AAA",
        "org_role": "org:admin",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers = {"Authorization": "Bearer org_token"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["workspace_type"] == "business"
    assert data["active_organization"]["clerk_org_id"] == "org_clerk_aaa"
    assert data["role"] == "ORG_ADMIN"

def test_cross_tenant_bola_protection(client, db, mock_clerk_verifier):
    """
    Verify BOLA/IDOR protection: Organization B cannot access Organization A's
    initiative data using direct object IDs or parameter manipulation.
    """
    # 1. Setup Org A initiative
    org_a = IdentityService.get_or_create_organization(db, "org_clerk_aaa", "Org A")
    user_a = IdentityService.get_or_create_user(db, "user_clerk_aaa", "User A", "user_a@example.com")
    # Provision context mock object
    class DummyContext:
        active_organization_id = org_a.id
        user_id = user_a.id
    
    init_a = InitiativesService.create_initiative(
        db=db,
        context=DummyContext(),
        name="Org A Strategic Initiative",
        business_area="IT",
        problem_statement="Problem A",
        proposed_intervention="Intervention A",
        expected_business_outcome="Outcome A",
        planned_start_date=None
    )
    
    # 2. Simulate User B (from Org B) attempting to read Org A's initiative
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_bbb",
        "email": "user_b@example.com",
        "name": "User B",
        "org_id": "org_clerk_bbb",
        "org_name": "Org B",
        "org_role": "org:member",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers = {"Authorization": "Bearer user_b_token"}
    # Call endpoint with Org A's initiative ID
    response = client.get(f"/api/v1/initiatives/{init_a.id}", headers=headers)
    
    # Must reject with 404 (to avoid exposing existence of record via 403)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Initiative not found." in response.json()["detail"]

def test_deleted_or_nonexistent_object_404(client, mock_clerk_verifier):
    """Verify that requesting a non-existent initiative returns 404."""
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_aaa",
        "email": "user_a@example.com",
        "name": "User A",
        "org_id": "org_clerk_aaa",
        "org_name": "Org A",
        "org_role": "org:admin",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers = {"Authorization": "Bearer org_token"}
    random_id = uuid.uuid4()
    response = client.get(f"/api/v1/initiatives/{random_id}", headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_unauthorized_update_rejected(client, db, mock_clerk_verifier):
    """Verify that a tenant cannot update another tenant's initiative details."""
    org_a = IdentityService.get_or_create_organization(db, "org_clerk_aaa", "Org A")
    user_a = IdentityService.get_or_create_user(db, "user_clerk_aaa", "User A", "user_a@example.com")
    class DummyContext:
        active_organization_id = org_a.id
        user_id = user_a.id

    init_a = InitiativesService.create_initiative(
        db=db,
        context=DummyContext(),
        name="Org A Private Initiative",
        business_area="HR",
        problem_statement="Problem A",
        proposed_intervention="Intervention A",
        expected_business_outcome="Outcome A",
        planned_start_date=None
    )

    # User B tries to update Org A initiative
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_bbb",
        "email": "user_b@example.com",
        "name": "User B",
        "org_id": "org_clerk_bbb",
        "org_name": "Org B",
        "org_role": "org:admin", # Admin role but in Org B
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    headers = {"Authorization": "Bearer user_b_token"}
    update_payload = {"name": "Maliciously Renamed Initiative"}
    response = client.put(f"/api/v1/initiatives/{init_a.id}", json=update_payload, headers=headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_secret_exposure_prevention_check(client):
    """Verify that settings environment or endpoints do not accidentally leak passwords or private connection URLs."""
    from src.core.config import settings
    # Ensure active database url with passwords is never printed directly or exposed via /health endpoint
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    # Ensure no credentials/URLs are leaked
    for key, val in data.items():
        assert "password" not in str(val).lower()
        assert "postgresql" not in str(val).lower()
        assert "4IgNXuc5vvduuFpL" not in str(val)
