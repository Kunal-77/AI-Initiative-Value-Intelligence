"use client";

import React from "react";
import { CreditCard, Zap, HardDrive, Lock } from "lucide-react";
import { SubscriptionBilling } from "../../types/admin";

export interface SubscriptionBillingCardProps {
  billing: SubscriptionBilling;
}

export function SubscriptionBillingCard({ billing }: SubscriptionBillingCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Enterprise Subscription & License Metering</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
          {billing.planName}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span className="font-semibold text-foreground">Seat Licenses Used</span>
            <span className="font-mono font-bold text-foreground">{billing.seatsUsed} / {billing.seatsAllocated}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${(billing.seatsUsed / billing.seatsAllocated) * 100}%` }} />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span className="font-semibold text-foreground">Storage Allocation</span>
            <span className="font-mono font-bold text-foreground">{billing.storageUsedGb} GB / {billing.storageMaxGb} GB</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${(billing.storageUsedGb / billing.storageMaxGb) * 100}%` }} />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span className="font-semibold text-foreground">AI Credits Quota</span>
            <span className="font-mono font-bold text-foreground">{(billing.aiCreditsUsed / 1000).toFixed(0)}k / {(billing.aiCreditsMax / 1000).toFixed(0)}k</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${(billing.aiCreditsUsed / billing.aiCreditsMax) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
