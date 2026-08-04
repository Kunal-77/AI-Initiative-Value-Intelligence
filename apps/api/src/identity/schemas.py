import uuid
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class UserResponse(BaseModel):
    id: uuid.UUID
    clerk_user_id: str
    display_name: Optional[str] = None
    email_snapshot: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class OrganizationResponse(BaseModel):
    id: uuid.UUID
    clerk_org_id: str
    name: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class MeResponse(BaseModel):
    user: UserResponse
    active_organization: Optional[OrganizationResponse] = None
    role: Optional[str] = None
    capabilities: List[str]
    workspace_type: str

    model_config = ConfigDict(from_attributes=True)

class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str
