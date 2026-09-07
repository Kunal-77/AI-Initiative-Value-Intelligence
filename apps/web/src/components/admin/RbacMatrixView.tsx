"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, X, Lock, Key, Users, UserCheck } from "lucide-react";
import { RoleDefinition, PermissionCategory, PermissionAction } from "../../types/admin";
import { ALL_CATEGORIES, ALL_ACTIONS } from "../../lib/admin/rbacEngine";

export interface RbacMatrixViewProps {
  roles: RoleDefinition[];
}

export function RbacMatrixView({ roles }: RbacMatrixViewProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "role_super_admin");

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  return (
    <div className="p-6 rounded-2xl border border-border/80 bg-card text-card-foreground shadow-lg space-y-6 bento-card motion-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/30 text-[#7DA7D9] shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Role-Based Access Control (RBAC) Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Granular permission mappings across core business modules and actions.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#7DA7D9]/15 text-[#7DA7D9] border border-[#7DA7D9]/30 font-semibold self-start sm:self-auto">
          {roles.length} Roles Active
        </span>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
        {roles.map((r) => {
          const isSelected = r.id === selectedRoleId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoleId(r.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-all duration-200 active:scale-95 flex items-center gap-2 ${isSelected
                  ? "bg-[#7DA7D9]/15 text-[#7DA7D9] border-[#7DA7D9]/40 shadow-xs font-bold"
                  : "bg-secondary/40 text-muted-foreground border-border/60 hover:bg-secondary/70 hover:text-foreground"
                }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${isSelected ? "text-[#7DA7D9]" : "text-muted-foreground"}`} />
              {r.name}
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{activeRole.name}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-muted-foreground">
            {activeRole.systemRole}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{activeRole.description}</p>
      </div>

      {/* Grid Permission Matrix */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-surface/50">
        <table className="w-full text-xs text-left">
          <thead className="bg-secondary/40 border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            <tr>
              <th className="py-3 px-4">Module / Category</th>
              {ALL_ACTIONS.map((act) => (
                <th key={act} className="py-3 px-3 text-center">{act}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {ALL_CATEGORIES.map((cat) => {
              const rule = activeRole.permissions.find((p) => p.category === cat);
              return (
                <tr key={cat} className="hover:bg-[#7DA7D9]/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground">{cat}</td>
                  {ALL_ACTIONS.map((act) => {
                    const isGranted = activeRole.systemRole === "SUPER_ADMIN" || Boolean(rule?.actions[act]);
                    return (
                      <td key={act} className="py-3 px-3 text-center">
                        {isGranted ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary/30 border border-border/40 text-muted-foreground/30">
                            <X className="w-3.5 h-3.5" />
                          </div>
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
