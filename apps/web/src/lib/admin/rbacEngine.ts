/**
 * Enterprise RBAC State Machine & Security Calculator Engine
 * Independent pure TypeScript authorization logic (React-decoupled).
 */

import {
  SystemRole,
  PermissionAction,
  PermissionCategory,
  RoleDefinition,
  SecurityStatus,
  AdminUser,
} from "../../types/admin";

export const ALL_CATEGORIES: PermissionCategory[] = [
  "Dashboard",
  "Initiatives",
  "AI Studio",
  "Financials",
  "Portfolio",
  "Workflow",
  "Reports",
  "Administration",
  "Users",
  "Settings",
  "Billing",
  "API",
];

export const ALL_ACTIONS: PermissionAction[] = [
  "READ",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "EXPORT",
  "ADMIN",
];

export function getDefaultRoleDefinitions(): RoleDefinition[] {
  return [
    {
      id: "role_super_admin",
      name: "Super Administrator",
      description: "Full unconstrained administrative access across all organization assets, security, and billing.",
      systemRole: "SUPER_ADMIN",
      permissions: ALL_CATEGORIES.map((cat) => ({
        category: cat,
        actions: { READ: true, CREATE: true, UPDATE: true, DELETE: true, APPROVE: true, EXPORT: true, ADMIN: true },
      })),
    },
    {
      id: "role_executive",
      name: "Executive Leader",
      description: "Strategic decision intelligence, portfolio approval, and financial oversight access.",
      systemRole: "EXECUTIVE",
      permissions: ALL_CATEGORIES.map((cat) => ({
        category: cat,
        actions: {
          READ: true,
          CREATE: cat === "Initiatives" || cat === "Workflow",
          UPDATE: cat === "Initiatives" || cat === "Workflow",
          DELETE: false,
          APPROVE: true,
          EXPORT: true,
          ADMIN: false,
        },
      })),
    },
    {
      id: "role_finance_mgr",
      name: "Finance Manager",
      description: "Complete access to financial metrics, capital ledgers, DCF forecasts, and budget reviews.",
      systemRole: "FINANCE_MANAGER",
      permissions: ALL_CATEGORIES.map((cat) => ({
        category: cat,
        actions: {
          READ: true,
          CREATE: cat === "Financials" || cat === "Billing",
          UPDATE: cat === "Financials" || cat === "Billing",
          DELETE: false,
          APPROVE: cat === "Financials" || cat === "Workflow",
          EXPORT: true,
          ADMIN: false,
        },
      })),
    },
    {
      id: "role_ai_analyst",
      name: "AI Value Analyst",
      description: "Access to AI Studio models, scenario comparison, confidence benchmarking, and telemetry.",
      systemRole: "AI_ANALYST",
      permissions: ALL_CATEGORIES.map((cat) => ({
        category: cat,
        actions: {
          READ: true,
          CREATE: cat === "AI Studio",
          UPDATE: cat === "AI Studio",
          DELETE: false,
          APPROVE: false,
          EXPORT: true,
          ADMIN: false,
        },
      })),
    },
    {
      id: "role_viewer",
      name: "Read-Only Viewer",
      description: "Read-only access to dashboard metrics and initiatives directory.",
      systemRole: "VIEWER",
      permissions: ALL_CATEGORIES.map((cat) => ({
        category: cat,
        actions: { READ: true, CREATE: false, UPDATE: false, DELETE: false, APPROVE: false, EXPORT: false, ADMIN: false },
      })),
    },
  ];
}

export function hasPermission(
  role: RoleDefinition,
  category: PermissionCategory,
  action: PermissionAction
): boolean {
  if (role.systemRole === "SUPER_ADMIN") return true;
  const catRule = role.permissions.find((p) => p.category === category);
  if (!catRule) return false;
  return Boolean(catRule.actions[action]);
}

export function calculateSecurityScore(sec: SecurityStatus): number {
  let score = 50; // Base score
  if (sec.mfaEnforced) score += 20;
  if (sec.ssoConfigured) score += 15;
  if (sec.scimConfigured) score += 10;
  if (sec.recentLoginFailures === 0) score += 5;
  return Math.min(score, 100);
}

export function filterUserDirectory(
  users: AdminUser[],
  searchQuery: string,
  roleFilter: string,
  statusFilter: string
): AdminUser[] {
  return users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = u.department.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDept) return false;
    }

    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;

    return true;
  });
}
