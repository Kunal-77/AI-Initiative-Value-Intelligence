import pytest
from src.identity.service import IdentityService
from src.identity.models import Organization, User, OrganizationMembership
from sqlalchemy import select

def test_database_tenant_isolation(db):
    """
    Test that users, organizations, and memberships are properly isolated in the database
    and memberships do not leak across organization/tenant boundaries.
    """
    # 1. Provision Tenant A (Organization A and User A)
    org_a = IdentityService.get_or_create_organization(db, "org_clerk_aaa", "Organization A")
    user_a = IdentityService.get_or_create_user(db, "user_clerk_aaa", "User A", "user_a@example.com")
    membership_a = IdentityService.get_or_create_membership(db, org_a.id, user_a.id, "ORG_ADMIN")

    # 2. Provision Tenant B (Organization B and User B)
    org_b = IdentityService.get_or_create_organization(db, "org_clerk_bbb", "Organization B")
    user_b = IdentityService.get_or_create_user(db, "user_clerk_bbb", "User B", "user_b@example.com")
    membership_b = IdentityService.get_or_create_membership(db, org_b.id, user_b.id, "VIEWER")

    # 3. Assert databases properties are distinct
    assert org_a.id != org_b.id
    assert user_a.id != user_b.id
    assert membership_a.id != membership_b.id

    # 4. Verify cross-tenant isolation checks at service layer
    # User A should NOT have membership in Organization B
    membership_a_in_b = IdentityService.get_membership(db, org_b.id, user_a.id)
    assert membership_a_in_b is None

    # User B should NOT have membership in Organization A
    membership_b_in_a = IdentityService.get_membership(db, org_a.id, user_b.id)
    assert membership_b_in_a is None

    # 5. Verify that standard querying is tenant-scoped
    # If we filter memberships by org_a, we should only see user_a
    memberships_a_stmt = select(OrganizationMembership).where(OrganizationMembership.organization_id == org_a.id)
    memberships_a = db.scalars(memberships_a_stmt).all()
    assert len(memberships_a) == 1
    assert memberships_a[0].user_id == user_a.id

    # If we filter memberships by org_b, we should only see user_b
    memberships_b_stmt = select(OrganizationMembership).where(OrganizationMembership.organization_id == org_b.id)
    memberships_b = db.scalars(memberships_b_stmt).all()
    assert len(memberships_b) == 1
    assert memberships_b[0].user_id == user_b.id

def test_api_tenant_isolation(client, mock_clerk_verifier):
    """
    Test that API context resolution respects the token org_id, and Tenant A's 
    API calls only return Tenant A's context, and Tenant B's calls return Tenant B's.
    """
    # Simulate Tenant A Request
    mock_clerk_verifier.return_value = {
        "sub": "user_a",
        "email": "user_a@example.com",
        "name": "User A",
        "org_id": "org_aaa",
        "org_name": "Org A",
        "org_role": "org:admin",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers_a = {"Authorization": "Bearer token_a"}
    response_a = client.get("/api/v1/me", headers=headers_a)
    assert response_a.status_code == 200
    data_a = response_a.json()
    assert data_a["user"]["clerk_user_id"] == "user_a"
    assert data_a["active_organization"]["clerk_org_id"] == "org_aaa"
    assert data_a["role"] == "ORG_ADMIN"

    # Simulate Tenant B Request
    mock_clerk_verifier.return_value = {
        "sub": "user_b",
        "email": "user_b@example.com",
        "name": "User B",
        "org_id": "org_bbb",
        "org_name": "Org B",
        "org_role": "org:member",
        "iss": "https://clerk.example.com",
        "exp": 9999999999,
        "nbf": 0
    }
    
    headers_b = {"Authorization": "Bearer token_b"}
    response_b = client.get("/api/v1/me", headers=headers_b)
    assert response_b.status_code == 200
    data_b = response_b.json()
    assert data_b["user"]["clerk_user_id"] == "user_b"
    assert data_b["active_organization"]["clerk_org_id"] == "org_bbb"
    assert data_b["role"] == "VIEWER"
    assert "manage_settings" not in data_b["capabilities"]  # Viewer has no admin capabilities
