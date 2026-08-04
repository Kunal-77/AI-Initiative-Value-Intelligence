"use client";

import React from "react";
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { GovernanceMetrics } from "../../types/workflow";

export interface GovernanceDashboardProps {
  metrics: GovernanceMetrics;
}

export function GovernanceDashboard({ metrics }: GovernanceDashboardProps) {
  const cards = [
    { label: "Approval Throughput", value: `${metrics.approvalThroughputCount} Passed`, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Avg Approval SLA", value: `${metrics.averageApprovalTimeDays} days`, icon: Clock, color: "text-accent" },
    { label: "Rejection Rate", value: `${metrics.rejectionPercentage}%`, icon: AlertCircle, color: "text-foreground" },
    { label: "Pending Reviews", value: `${metrics.pendingPercentage}%`, icon: Clock, color: "text-amber-500" },
    { label: "Active Escalations", value: `${metrics.escalationsCount} Escalated`, icon: AlertTriangle, color: "text-rose-500" },
    { label: "Primary SLA Bottleneck", value: metrics.bottleneckStage.replace("_", " "), icon: ShieldCheck, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>

            <span className={`text-base font-extrabold font-mono tracking-tight block ${c.color}`}>
              {c.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
