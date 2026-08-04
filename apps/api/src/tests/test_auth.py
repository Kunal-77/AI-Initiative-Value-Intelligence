import pytest
from fastapi import status
from src.identity.authorization import ROLE_CAPABILITIES, AuthorizationService

def test_health_check_public(client):
    """
    Verify /health check is publicly accessible and returns correctly.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "version" in data

def test_root_endpoint(client):
    """
    Verify absolute root endpoint returns service info.
    """
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["service"] == "AI Initiative Value Intelligence API"
    assert data["status"] == "running"
    assert data["version"] == "1.0.0"

def test_absolute_health_check(client):
    """
    Verify absolute /health endpoint returns correctly with uptime.
    """
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime" in data
    assert data["version"] == "1.0.0"

def test_me_protected_requires_auth(client):
    """
    Verify /me requires bearer token and returns 401.
    """
    response = client.get("/api/v1/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_me_resolves_user_and_organization(client, mock_clerk_verifier):
    """
    Verify /me resolves Clerk identity, provisions DB user/org, and returns correct capabilities.
    """
    # Setup mock payload
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "org_id": "org_clerk_999",
        "org_name": "Test Org Inc",
        "org_role": "org:admin",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    # Execute request
    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/me", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Assert User properties
    assert data["user"]["clerk_user_id"] == "user_clerk_123"
    assert data["user"]["display_name"] == "Alex Tester"
    assert data["user"]["email_snapshot"] == "test@example.com"
    assert data["user"]["id"] is not None
    
    # Assert Organization properties
    assert data["active_organization"]["clerk_org_id"] == "org_clerk_999"
    assert data["active_organization"]["name"] == "Test Org Inc"
    assert data["active_organization"]["id"] is not None
    
    # Assert Roles & Capabilities
    assert data["role"] == "ORG_ADMIN"
    expected_capabilities = list(ROLE_CAPABILITIES["ORG_ADMIN"])
    assert set(data["capabilities"]) == set(expected_capabilities)

def test_me_resolves_user_and_organization_nested_claims(client, mock_clerk_verifier):
    """
    Verify /me resolves Clerk identity, provisions DB user/org, and returns correct capabilities
    when organization claims are nested inside the "o" object.
    """
    # Setup mock payload with nested "o" claims
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "o": {
            "id": "org_clerk_999",
            "slug": "test-org-inc",
            "rol": "org:admin"
        },
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    # Execute request
    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/me", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Assert User properties
    assert data["user"]["clerk_user_id"] == "user_clerk_123"
    assert data["user"]["display_name"] == "Alex Tester"
    assert data["user"]["email_snapshot"] == "test@example.com"
    assert data["user"]["id"] is not None
    
    # Assert Organization properties
    assert data["active_organization"]["clerk_org_id"] == "org_clerk_999"
    assert data["active_organization"]["name"] == "test-org-inc"
    assert data["active_organization"]["id"] is not None
    
    # Assert Roles & Capabilities
    assert data["role"] == "ORG_ADMIN"
    expected_capabilities = list(ROLE_CAPABILITIES["ORG_ADMIN"])
    assert set(data["capabilities"]) == set(expected_capabilities)

def test_me_no_organization_context(client, mock_clerk_verifier):
    """
    Verify /me resolves user even if no active organization context exists.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/me", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["user"]["clerk_user_id"] == "user_clerk_123"
    assert data["active_organization"] is None
    assert data["role"] is None
    assert data["capabilities"] == []

def test_role_to_capability_mapping():
    """
    Test mapping of Clerk roles to internal capabilities.
    """
    assert set(AuthorizationService.get_capabilities_for_role("org:admin")) == ROLE_CAPABILITIES["ORG_ADMIN"]
    assert set(AuthorizationService.get_capabilities_for_role("org:member")) == ROLE_CAPABILITIES["VIEWER"]
    assert set(AuthorizationService.get_capabilities_for_role("finance")) == ROLE_CAPABILITIES["FINANCE_ANALYST"]
    assert set(AuthorizationService.get_capabilities_for_role("invalid_role")) == ROLE_CAPABILITIES["VIEWER"]

def test_me_invalid_token(client, mock_clerk_verifier):
    """
    Verify /me returns 401 if token signature/expiration validation fails.
    """
    from fastapi import HTTPException
    mock_clerk_verifier.side_effect = HTTPException(status_code=401, detail="Identity verification failed.")
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401

def test_me_arbitrary_org_ignored(client, mock_clerk_verifier):
    """
    Verify that arbitrary organization context parameters supplied by the frontend
    are ignored in favor of the server-resolved tenant context.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "org_id": "org_clerk_999",
        "org_name": "Test Org Inc",
        "org_role": "org:admin",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    # Attempt to override org context using query parameters
    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/me?org_id=org_evil_hacker", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    # Scoped tenant must match the claim inside the JWT (org_clerk_999), ignoring parameter input
    assert data["active_organization"]["clerk_org_id"] == "org_clerk_999"


def test_me_resolves_personal_workspace(client, mock_clerk_verifier):
    """
    Verify /me resolves user with workspace_type="personal" when no org_id exists.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/me", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["user"]["clerk_user_id"] == "user_clerk_123"
    assert data["workspace_type"] == "personal"
    assert data["active_organization"] is None


def test_require_personal_workspace_allows_personal(client, mock_clerk_verifier):
    """
    Verify that personal-workspace-protected test endpoint allows personal tokens.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/personal-test", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["workspace_type"] == "personal"


def test_require_personal_workspace_blocks_business(client, mock_clerk_verifier):
    """
    Verify that personal-workspace-protected test endpoint rejects organization tokens.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "org_id": "org_clerk_999",
        "org_name": "Test Org Inc",
        "org_role": "org:admin",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/personal-test", headers=headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == "Operation permitted only in Personal Workspace context."


def test_require_capability_blocks_personal(client, mock_clerk_verifier):
    """
    Verify that a business capability-protected route rejects personal workspace tokens.
    """
    mock_clerk_verifier.return_value = {
        "sub": "user_clerk_123",
        "email": "test@example.com",
        "name": "Alex Tester",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }

    headers = {"Authorization": "Bearer fake_token"}
    response = client.get("/api/v1/initiatives", headers=headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Active tenant context is missing" in response.json()["detail"]


