"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AppHeader,
  AdminHeaderBanner,
  UserDirectoryTable,
  RbacMatrixView,
  OrganizationSettingsForm,
  SecurityCenterCard,
  SubscriptionBillingCard,
  AuditCenterTable,
  SkeletonMetricsRow,
  LazyViewport,
  SkeletonCard,
  SkeletonTable,
} from "@/components/ui";
import {
  getAdminUsers,
  getOrganizationProfile,
  getRoleDefinitions,
  getSecurityStatus,
  getSubscriptionBilling,
  getAdminAuditLogs,
  updateUserStatus,
  inviteAdminUser,
} from "@/services/admin/adminService";
import {
  AdminUser,
  OrganizationProfile,
  RoleDefinition,
  SecurityStatus,
  SubscriptionBilling,
  AdminAuditLog,
  UserStatus,
} from "@/types/admin";

export default function BusinessAdminPage() {
  const { orgId } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [security, setSecurity] = useState<SecurityStatus | null>(null);
  const [billing, setBilling] = useState<SubscriptionBilling | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, rRes, sRes, bRes, aRes] = await Promise.all([
        getAdminUsers(),
        getOrganizationProfile(),
        getRoleDefinitions(),
        getSecurityStatus(),
        getSubscriptionBilling(),
        getAdminAuditLogs(),
      ]);
      setUsers(uRes);
      setProfile(pRes);
      setRoles(rRes);
      setSecurity(sRes);
      setBilling(bRes);
      setAuditLogs(aRes);
    } catch (err) {
      console.error("Admin data load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadAdminData();
    }
  }, [orgId]);

  const handleInviteUser = async (email: string, role: string, dept: string) => {
    const newUser = await inviteAdminUser(email, role, dept);
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateStatus = async (userId: string, newStatus: UserStatus) => {
    await updateUserStatus(userId, newStatus);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  if (!orgId || loading || !security || !billing || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Enterprise Administration" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppHeader badge="Enterprise Administration" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. Admin Header Scorecard Banner */}
        <AdminHeaderBanner userCount={users.length} security={security} billing={billing} />

        {/* 2. Enterprise User Directory & Access Control Table */}
        <UserDirectoryTable
          users={users}
          onInviteUser={handleInviteUser}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* 3. Role-Based Access Control (RBAC) Matrix View */}
        <LazyViewport name="RBAC Matrix Rules Configurator" placeholder={<SkeletonTable rows={4} />} minHeight="250px">
          {() => <RbacMatrixView roles={roles} />}
        </LazyViewport>
 
        {/* 4. Organization Settings Form */}
        <LazyViewport name="Enterprise Settings Profiles" placeholder={<SkeletonCard />} minHeight="300px">
          {() => <OrganizationSettingsForm profile={profile} />}
        </LazyViewport>
 
        {/* 5. Main Grid: Security & Billing (Left 6 / Right 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LazyViewport name="Compliance Security Health Monitor" placeholder={<SkeletonCard />} minHeight="200px">
            {() => <SecurityCenterCard security={security} />}
          </LazyViewport>
          <LazyViewport name="Billing Subscription Registry" placeholder={<SkeletonCard />} minHeight="200px">
            {() => <SubscriptionBillingCard billing={billing} />}
          </LazyViewport>
        </div>
 
        {/* 6. System Audit Trail & Security Event Table */}
        <LazyViewport name="Full Activity Audit Trail" placeholder={<SkeletonTable rows={4} />} minHeight="250px">
          {() => <AuditCenterTable logs={auditLogs} />}
        </LazyViewport>
      </main>
    </div>
  );
}
