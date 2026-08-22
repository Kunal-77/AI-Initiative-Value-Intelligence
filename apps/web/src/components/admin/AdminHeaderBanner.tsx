"use client";

import React from "react";
import { ShieldCheck, Users, HardDrive, Cpu, DollarSign, Lock } from "lucide-react";
import { SecurityStatus, SubscriptionBilling } from "../../types/admin";

export interface AdminHeaderBannerProps {
  userCount: number;
  security: SecurityStatus;
  billing: SubscriptionBilling;
}

export function AdminHeaderBanner({ userCount, security, billing }: AdminHeaderBannerProps) {
  const cards = [
    { label: "Active Enterprise Users", value: `${userCount} Active`, icon: Users, color: "text-foreground" },
    { label: "Organization Security", value: `${security.securityScore}/100`, icon: ShieldCheck, color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Seat License Usage", value: `${billing.seatsUsed} / ${billing.seatsAllocated}`, icon: Lock, color: "text-blue-500 dark:text-blue-400" },
    { label: "Storage Utilization", value: `${billing.storageUsedGb} GB / ${billing.storageMaxGb} GB`, icon: HardDrive, color: "text-foreground" },
    { label: "AI Tokens Consumption", value: `${(billing.aiCreditsUsed / 1000).toFixed(0)}k / ${(billing.aiCreditsMax / 1000).toFixed(0)}k`, icon: Cpu, color: "text-cyan-500 dark:text-cyan-400" },
    { label: "Subscription Plan", value: billing.planName, icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs space-y-1 hover:border-blue-500/40 hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>

            <span className={`text-base sm:text-lg font-extrabold font-mono tracking-tight block ${c.color}`}>
              {c.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
