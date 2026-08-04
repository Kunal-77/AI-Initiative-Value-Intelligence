"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, X, Lock } from "lucide-react";
import { RoleDefinition, PermissionCategory, PermissionAction } from "../../types/admin";
import { ALL_CATEGORIES, ALL_ACTIONS } from "../../lib/admin/rbacEngine";

export interface RbacMatrixViewProps {
  roles: RoleDefinition[];
}

export function RbacMatrixView({ roles }: RbacMatrixViewProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "role_super_admin");

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Role-Based Access Control (RBAC) Permission Matrix</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          {roles.length} System Roles Defined
        </span>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto py-1">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRoleId(r.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
              r.id === selectedRoleId
                ? "bg-accent/15 text-accent border-accent/40 font-bold"
                : "bg-secondary/30 text-muted-foreground border-border hover:bg-secondary/80"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-1">
        <span className="font-bold text-foreground">{activeRole.name}</span>
        <p className="text-[11px] text-muted-foreground">{activeRole.description}</p>
      </div>

      {/* Grid Permission Matrix */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-secondary/40 border-b border-border text-[10px] font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3">Module / Category</th>
              {ALL_ACTIONS.map((act) => (
                <th key={act} className="py-2.5 px-2 text-center">{act}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ALL_CATEGORIES.map((cat) => {
              const rule = activeRole.permissions.find((p) => p.category === cat);
              return (
                <tr key={cat} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-2 px-3 font-semibold text-foreground">{cat}</td>
                  {ALL_ACTIONS.map((act) => {
                    const isGranted = activeRole.systemRole === "SUPER_ADMIN" || Boolean(rule?.actions[act]);
                    return (
                      <td key={act} className="py-2 px-2 text-center">
                        {isGranted ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
