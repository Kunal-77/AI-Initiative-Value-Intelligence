/**
 * Enterprise Administration & Governance Service Layer
 * Interfaces mapping 1:1 to future FastAPI /api/v1/admin REST endpoints.
 */

import {
  AdminUser,
  OrganizationProfile,
  RoleDefinition,
  SecurityStatus,
  SubscriptionBilling,
  AdminAuditLog,
  TeamCapacity,
  UserStatus,
} from "../../types/admin";
import { getDefaultRoleDefinitions, calculateSecurityScore } from "../../lib/admin/rbacEngine";

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr_1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@acme.com",
    role: "SUPER_ADMIN",
    department: "Executive / Finance",
    businessUnit: "Global Operations",
    status: "ACTIVE",
    lastActive: "2m ago",
    avatarInitials: "SJ",
  },
  {
    id: "usr_2",
    name: "Alex Rivera",
    email: "alex.rivera@acme.com",
    role: "PORTFOLIO_MANAGER",
    department: "Software Engineering",
    businessUnit: "Technology Group",
    status: "ACTIVE",
    lastActive: "15m ago",
    avatarInitials: "AR",
  },
  {
    id: "usr_3",
    name: "Marcus Vance",
    role: "EXECUTIVE",
    email: "marcus.vance@acme.com",
    department: "Technology",
    businessUnit: "Technology Group",
    status: "ACTIVE",
    lastActive: "1h ago",
    avatarInitials: "MV",
  },
  {
    id: "usr_4",
    name: "David Miller",
    email: "david.miller@acme.com",
    role: "PROJECT_MANAGER",
    department: "Operations",
    businessUnit: "Global Operations",
    status: "ACTIVE",
    lastActive: "3h ago",
    avatarInitials: "DM",
  },
  {
    id: "usr_5",
    name: "Elena Rostova",
    email: "elena.rostova@acme.com",
    role: "AUDITOR",
    department: "Legal & Compliance",
    businessUnit: "Corporate Governance",
    status: "INVITED",
    lastActive: "Pending Invite",
    avatarInitials: "ER",
  },
];

export const MOCK_ORG_PROFILE: OrganizationProfile = {
  id: "org_acme_corp",
  name: "Acme Enterprise Solutions",
  legalEntity: "Acme Corp Inc.",
  industry: "Financial Services & Fintech",
  timezone: "UTC-05:00 (US Eastern Time)",
  primaryCurrency: "USD ($)",
  fiscalYearStart: "January 1",
  supportEmail: "enterprise-support@acme.com",
  primaryColor: "#6366f1",
};

export const MOCK_SECURITY_STATUS: SecurityStatus = {
  securityScore: 90,
  mfaEnforced: true,
  activeSessionsCount: 14,
  sessionTimeoutMinutes: 30,
  ssoConfigured: true,
  scimConfigured: true,
  recentLoginFailures: 0,
};

export const MOCK_BILLING: SubscriptionBilling = {
  planName: "Enterprise Platinum",
  seatsAllocated: 50,
  seatsUsed: 14,
  storageUsedGb: 124.5,
  storageMaxGb: 1000,
  aiCreditsUsed: 42800,
  aiCreditsMax: 500000,
  nextRenewalDate: "2027-01-01",
  monthlySpendUsd: 14500,
};

export const MOCK_ADMIN_AUDIT: AdminAuditLog[] = [
  {
    id: "aud_adm_1",
    actor: "Sarah Jenkins (Super Admin)",
    action: "UPDATE_ROLE_PERMISSIONS",
    target: "Executive Leader Role",
    category: "ROLE",
    timestamp: "2026-08-04T09:30:00Z",
    ipAddress: "192.168.1.102",
  },
  {
    id: "aud_adm_2",
    actor: "Sarah Jenkins (Super Admin)",
    action: "INVITE_USER",
    target: "elena.rostova@acme.com",
    category: "USER",
    timestamp: "2026-08-04T10:15:00Z",
    ipAddress: "192.168.1.102",
  },
  {
    id: "aud_adm_3",
    actor: "System Automated Security Guard",
    action: "ENFORCE_MFA_POLICY",
    target: "Organization Global Policy",
    category: "SECURITY",
    timestamp: "2026-08-04T12:00:00Z",
    ipAddress: "127.0.0.1",
  },
];

export const MOCK_TEAMS: TeamCapacity[] = [
  { id: "team_1", teamName: "AI Value Studio Squad", department: "Technology", lead: "Marcus Vance", membersCount: 6, utilizationPercentage: 88 },
  { id: "team_2", teamName: "Customer Support Automation Squad", department: "Operations", lead: "David Miller", membersCount: 8, utilizationPercentage: 92 },
  { id: "team_3", teamName: "Legal & Compliance Audit Squad", department: "Legal", lead: "Elena Rostova", membersCount: 4, utilizationPercentage: 75 },
];

export async function getAdminUsers(): Promise<AdminUser[]> {
  return MOCK_ADMIN_USERS;
}

export async function getOrganizationProfile(): Promise<OrganizationProfile> {
  return MOCK_ORG_PROFILE;
}

export async function getRoleDefinitions(): Promise<RoleDefinition[]> {
  return getDefaultRoleDefinitions();
}

export async function getSecurityStatus(): Promise<SecurityStatus> {
  return {
    ...MOCK_SECURITY_STATUS,
    securityScore: calculateSecurityScore(MOCK_SECURITY_STATUS),
  };
}

export async function getSubscriptionBilling(): Promise<SubscriptionBilling> {
  return MOCK_BILLING;
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  return MOCK_ADMIN_AUDIT;
}

export async function getTeamCapacities(): Promise<TeamCapacity[]> {
  return MOCK_TEAMS;
}

export async function updateUserStatus(userId: string, newStatus: UserStatus): Promise<void> {
  const user = MOCK_ADMIN_USERS.find((u) => u.id === userId);
  if (user) user.status = newStatus;
}

export async function inviteAdminUser(email: string, role: string, department: string): Promise<AdminUser> {
  const newUser: AdminUser = {
    id: `usr_${Date.now()}`,
    name: email.split("@")[0].replace(".", " "),
    email,
    role: role as any,
    department,
    businessUnit: "Global Operations",
    status: "INVITED",
    lastActive: "Pending Invite",
    avatarInitials: email.substring(0, 2).toUpperCase(),
  };
  MOCK_ADMIN_USERS.unshift(newUser);
  return newUser;
}
