import uuid
from typing import Dict, List, Set, Optional
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.security import ClerkTokenVerifier
from src.identity.models import User, Organization, OrganizationMembership
from src.identity.service import IdentityService

# Standard Bearer token extraction helper (do not auto-error with 403)
security_scheme = HTTPBearer(auto_error=False)

# Role-to-Capability configuration matrix
ROLE_CAPABILITIES: Dict[str, Set[str]] = {
    "ORG_ADMIN": {
        "view_portfolio", "view_initiative", "manage_members", "manage_settings",
        "create_initiative", "edit_initiative", "approve_initiative",
        "manage_financials", "validate_metrics", "record_decision",
        "request_analysis", "view_audit_logs", "ingest_data", "manage_sources"
    },
    "EXECUTIVE": {
        "view_portfolio", "view_initiative", "approve_initiative", "record_decision", "request_analysis"
    },
    "FINANCE_ANALYST": {
        "view_portfolio", "view_initiative", "manage_financials", "validate_metrics", "view_audit_logs"
    },
    "INITIATIVE_OWNER": {
        "view_portfolio", "view_initiative", "create_initiative", "edit_initiative"
    },
    "REVIEWER": {
        "view_portfolio", "view_initiative", "validate_metrics"
    },
    "VIEWER": {
        "view_portfolio", "view_initiative"
    }
}

class AuthorizationService:
    @staticmethod
    def map_clerk_role(clerk_role: Optional[str]) -> str:
        """
        Maps Clerk membership roles (e.g. org:admin, org:member) to our internal role strings.
        """
        if not clerk_role:
            return "VIEWER"
        
        role = clerk_role.upper()
        if "ORG:ADMIN" in role or "ADMIN" in role:
            return "ORG_ADMIN"
        elif "MEMBER" in role or "ORG:MEMBER" in role:
            return "VIEWER"
        elif "EXECUTIVE" in role:
            return "EXECUTIVE"
        elif "ANALYST" in role or "FINANCE" in role:
            return "FINANCE_ANALYST"
        
        return "VIEWER"

    @staticmethod
    def get_capabilities_for_role(role: str) -> List[str]:
        mapped = AuthorizationService.map_clerk_role(role)
        return list(ROLE_CAPABILITIES.get(mapped, set()))


from enum import Enum

class WorkspaceType(str, Enum):
    BUSINESS = "business"
    PERSONAL = "personal"


class AuthorizationContext(BaseModel):
    """
    Unified context resolved for authenticated requests.
    Stores internal ORM models along with role-mapping attributes.
    """
    user_id: uuid.UUID
    workspace_type: WorkspaceType = WorkspaceType.BUSINESS
    clerk_user_id: str
    display_name: Optional[str] = None
    email_snapshot: Optional[str] = None
    
    active_organization_id: Optional[uuid.UUID] = None
    clerk_org_id: Optional[str] = None
    organization_name: Optional[str] = None
    
    role: Optional[str] = None
    capabilities: List[str] = []


async def get_auth_context(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> AuthorizationContext:
    """
    Step 1: Extract and verify bearer token.
    Step 2: Resolve or auto-provision internal User.
    Step 3: Resolve or auto-provision active Organization (if org_id claim present).
    Step 4: Resolve organization membership and construct capabilities list.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing."
        )
    token = credentials.credentials
    # verify identity & validate claims
    payload = await ClerkTokenVerifier.verify_token(token)
    
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject identity (sub)."
        )
        
    # extract user metadata claims (Clerk payloads can have customized profiles)
    email = payload.get("email") or payload.get("primary_email_address")
    display_name = payload.get("name") or payload.get("display_name")
    
    # Resolve user
    user = IdentityService.get_or_create_user(db, clerk_user_id, display_name, email)
    
    # Resolve active organization
    org_claim = payload.get("org_metadata") or payload.get("o") or {}
    clerk_org_id = payload.get("org_id") or org_claim.get("id")
    org_id = None
    org_name = None
    internal_role = None
    capabilities = []
    
    if clerk_org_id:
        # Resolve org name from custom claim, slug, or default fallback
        custom_org_name = payload.get("org_name") or org_claim.get("slug")
        org = IdentityService.get_or_create_organization(db, clerk_org_id, custom_org_name)
        org_id = org.id
        org_name = org.name
        
        # Get active Clerk role from payload or nested claim and map to system role
        clerk_role = payload.get("org_role") or org_claim.get("rol")
        internal_role = AuthorizationService.map_clerk_role(clerk_role)
        
        # Resolve/Sync membership in system of record
        IdentityService.get_or_create_membership(db, org.id, user.id, internal_role)
        
        # Load capability set
        capabilities = AuthorizationService.get_capabilities_for_role(internal_role)
    workspace_type = WorkspaceType.BUSINESS if clerk_org_id else WorkspaceType.PERSONAL
        
    return AuthorizationContext(
        user_id=user.id,
        clerk_user_id=user.clerk_user_id,
        display_name=user.display_name,
        email_snapshot=user.email_snapshot,
        active_organization_id=org_id,
        clerk_org_id=clerk_org_id,
        organization_name=org_name,
        role=internal_role,
        capabilities=capabilities,
        workspace_type=workspace_type
    )


def require_capability(capability: str):
    """
    Route dependency that demands a specific capability.
    Enforces active organization scope.
    """
    async def dependency(context: AuthorizationContext = Depends(get_auth_context)):
        if not context.active_organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Active tenant context is missing. Please select an organization."
            )
        if capability not in context.capabilities:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Insufficient capability: {capability}."
            )
        return context
    return dependency


async def require_personal_workspace(
    context: AuthorizationContext = Depends(get_auth_context)
) -> AuthorizationContext:
    """
    Route dependency that demands Personal Workspace context.
    Rejects requests associated with active organizations.
    """
    if context.workspace_type != WorkspaceType.PERSONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation permitted only in Personal Workspace context."
        )
    return context
