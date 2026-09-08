import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.identity.models import User, Organization, OrganizationMembership

class IdentityService:
    @staticmethod
    def get_user_by_clerk_id(db: Session, clerk_user_id: str) -> User | None:
        """
        Retrieves user by Clerk user ID.
        """
        stmt = select(User).where(User.clerk_user_id == clerk_user_id)
        return db.scalars(stmt).first()

    @staticmethod
    def get_or_create_user(
        db: Session,
        clerk_user_id: str,
        display_name: str | None = None,
        email: str | None = None
    ) -> User:
        """
        Retrieves existing user or auto-provisions a new user in the system database.
        Includes rollback recovery for concurrent race conditions.
        """
        user = IdentityService.get_user_by_clerk_id(db, clerk_user_id)
        if not user:
            try:
                user = User(
                    id=uuid.uuid4(),
                    clerk_user_id=clerk_user_id,
                    display_name=display_name,
                    email_snapshot=email,
                    status="ACTIVE"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                user = IdentityService.get_user_by_clerk_id(db, clerk_user_id)
                if not user:
                    raise
        else:
            # Sync metadata changes if found
            changed = False
            if display_name and user.display_name != display_name:
                user.display_name = display_name
                changed = True
            if email and user.email_snapshot != email:
                user.email_snapshot = email
                changed = True
            if changed:
                try:
                    db.commit()
                    db.refresh(user)
                except Exception:
                    db.rollback()
        return user

    @staticmethod
    def get_organization_by_clerk_id(db: Session, clerk_org_id: str) -> Organization | None:
        """
        Retrieves organization by Clerk organization ID.
        """
        stmt = select(Organization).where(Organization.clerk_org_id == clerk_org_id)
        return db.scalars(stmt).first()

    @staticmethod
    def get_or_create_organization(
        db: Session,
        clerk_org_id: str,
        name: str | None = None
    ) -> Organization:
        """
        Retrieves existing organization or auto-provisions a new organization.
        Includes rollback recovery for concurrent race conditions.
        """
        org = IdentityService.get_organization_by_clerk_id(db, clerk_org_id)
        if not org:
            try:
                org = Organization(
                    id=uuid.uuid4(),
                    clerk_org_id=clerk_org_id,
                    name=name or f"Organization {clerk_org_id[:8] if len(clerk_org_id) > 8 else clerk_org_id}",
                    status="ACTIVE"
                )
                db.add(org)
                db.commit()
                db.refresh(org)
            except Exception:
                db.rollback()
                org = IdentityService.get_organization_by_clerk_id(db, clerk_org_id)
                if not org:
                    raise
        else:
            if name and org.name != name:
                org.name = name
                try:
                    db.commit()
                    db.refresh(org)
                except Exception:
                    db.rollback()
        return org

    @staticmethod
    def get_membership(
        db: Session,
        organization_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> OrganizationMembership | None:
        """
        Retrieves organization membership for a user.
        """
        stmt = select(OrganizationMembership).where(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == user_id
        )
        return db.scalars(stmt).first()

    @staticmethod
    def get_or_create_membership(
        db: Session,
        organization_id: uuid.UUID,
        user_id: uuid.UUID,
        role: str,
        status: str = "ACTIVE"
    ) -> OrganizationMembership:
        """
        Retrieves or syncs the organization membership role/status.
        Includes rollback recovery for concurrent race conditions.
        """
        membership = IdentityService.get_membership(db, organization_id, user_id)
        if not membership:
            try:
                membership = OrganizationMembership(
                    id=uuid.uuid4(),
                    organization_id=organization_id,
                    user_id=user_id,
                    role=role,
                    status=status
                )
                db.add(membership)
                db.commit()
                db.refresh(membership)
            except Exception:
                db.rollback()
                membership = IdentityService.get_membership(db, organization_id, user_id)
                if not membership:
                    raise
        else:
            if membership.role != role or membership.status != status:
                membership.role = role
                membership.status = status
                try:
                    db.commit()
                    db.refresh(membership)
                except Exception:
                    db.rollback()
        return membership
