from fastapi import APIRouter, Depends
from src.identity.authorization import AuthorizationContext, get_auth_context
from src.identity.schemas import MeResponse, UserResponse, OrganizationResponse, HealthResponse
from src.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    """
    Public health check endpoint.
    """
    return HealthResponse(
        status="healthy",
        environment=settings.ENVIRONMENT,
        version="0.1.0"
    )

@router.get("/me", response_model=MeResponse)
def get_me(context: AuthorizationContext = Depends(get_auth_context)):
    """
    Protected endpoint to resolve internal identity, active organization, and capabilities.
    """
    user_res = UserResponse(
        id=context.user_id,
        clerk_user_id=context.clerk_user_id,
        display_name=context.display_name,
        email_snapshot=context.email_snapshot,
        status="ACTIVE"
    )
    
    org_res = None
    if context.active_organization_id:
        org_res = OrganizationResponse(
            id=context.active_organization_id,
            clerk_org_id=context.clerk_org_id,
            name=context.organization_name,
            status="ACTIVE"
        )
        
    return MeResponse(
        user=user_res,
        active_organization=org_res,
        role=context.role,
        capabilities=context.capabilities,
        workspace_type=context.workspace_type
    )

from src.identity.authorization import require_personal_workspace

@router.get("/personal-test")
def get_personal_test(context: AuthorizationContext = Depends(require_personal_workspace)):
    """
    Development/Testing Only: Endpoint to verify require_personal_workspace dependency.
    This endpoint is not used in production and will be removed or disabled before deployment.
    """
    return {"status": "success", "workspace_type": context.workspace_type}
