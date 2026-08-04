/**
 * Strongly Typed Interfaces for Enterprise Administration, RBAC & Organization Management Platform
 * Single Source of Truth for Organization Profile, User Directory, RBAC, Security & System Billing.
 */

export type SystemRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "EXECUTIVE"
  | "PORTFOLIO_MANAGER"
  | "FINANCE_MANAGER"
  | "AI_ANALYST"
  | "DEPARTMENT_MANAGER"
  | "PROJECT_MANAGER"
  | "AUDITOR"
  | "VIEWER";

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "DEACTIVATED";

export type PermissionAction = "READ" | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "EXPORT" | "ADMIN";

export type PermissionCategory =
  | "Dashboard"
  | "Initiatives"
  | "AI Studio"
  | "Financials"
  | "Portfolio"
  | "Workflow"
  | "Reports"
  | "Administration"
  | "Users"
  | "Settings"
  | "Billing"
  | "API";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  businessUnit: string;
  status: UserStatus;
  lastActive: string;
  avatarInitials: string;
}

export interface PermissionMatrixRule {
  category: PermissionCategory;
  actions: Record<PermissionAction, boolean>;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  systemRole: SystemRole;
  isCustom?: boolean;
  permissions: PermissionMatrixRule[];
}

export interface OrganizationProfile {
  id: string;
  name: string;
  legalEntity: string;
  industry: string;
  timezone: string;
  primaryCurrency: string;
  fiscalYearStart: string;
  supportEmail: string;
  primaryColor: string;
}

export interface SecurityStatus {
  securityScore: number; // 0-100
  mfaEnforced: boolean;
  activeSessionsCount: number;
  sessionTimeoutMinutes: number;
  ssoConfigured: boolean;
  scimConfigured: boolean;
  recentLoginFailures: number;
}

export interface SubscriptionBilling {
  planName: "Enterprise Platinum" | "Enterprise Gold" | "Standard";
  seatsAllocated: number;
  seatsUsed: number;
  storageUsedGb: number;
  storageMaxGb: number;
  aiCreditsUsed: number;
  aiCreditsMax: number;
  nextRenewalDate: string;
  monthlySpendUsd: number;
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: "USER" | "ROLE" | "SECURITY" | "SETTINGS" | "BILLING";
  timestamp: string;
  ipAddress: string;
}

export interface TeamCapacity {
  id: string;
  teamName: string;
  department: string;
  lead: string;
  membersCount: number;
  utilizationPercentage: number;
}
