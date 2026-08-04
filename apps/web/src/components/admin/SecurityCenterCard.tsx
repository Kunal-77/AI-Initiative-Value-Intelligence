"use client";

import React from "react";
import { ShieldCheck, Lock, Smartphone, Key, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SecurityStatus } from "../../types/admin";

export interface SecurityCenterCardProps {
  security: SecurityStatus;
}

export function SecurityCenterCard({ security }: SecurityCenterCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Organization Security & SSO Compliance</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
          Score: {security.securityScore}/100
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-accent" /> Multi-Factor Authentication (MFA)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Enforced
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Mandatory TOTP authenticator for all administrator logins.</p>
        </div>

        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" /> Single Sign-On (SSO & SAML 2.0)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Active
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Okta / Azure AD Enterprise SAML authentication active.</p>
        </div>

        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> Session Inactivity Timeout
            </span>
            <span className="font-mono font-bold text-foreground">{security.sessionTimeoutMinutes} min</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Automatic token invalidation upon idle duration.</p>
        </div>

        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SCIM Directory Sync
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Active
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Automated user provisioning and deprovisioning stream.</p>
        </div>
      </div>
    </div>
  );
}
