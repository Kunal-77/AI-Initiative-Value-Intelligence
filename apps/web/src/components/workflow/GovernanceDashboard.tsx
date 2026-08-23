"use client";

import React from "react";
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { GovernanceMetrics } from "../../types/workflow";

export interface GovernanceDashboardProps {
  metrics: GovernanceMetrics | null;
  loading?: boolean;
}

export function GovernanceDashboard({ metrics, loading = false }: GovernanceDashboardProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs space-y-2 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-secondary/80 rounded" />
              <div className="h-3.5 w-3.5 bg-secondary/80 rounded" />
            </div>
            <div className="h-5 w-12 bg-secondary/80 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Approval Throughput", value: `${metrics.approvalThroughputCount} Passed`, icon: CheckCircle2, color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Avg Approval SLA", value: `${metrics.averageApprovalTimeDays} days`, icon: Clock, color: "text-blue-500 dark:text-blue-400" },
    { label: "Rejection Rate", value: `${metrics.rejectionPercentage}%`, icon: AlertCircle, color: "text-foreground" },
    { label: "Pending Reviews", value: `${metrics.pendingPercentage}%`, icon: Clock, color: "text-amber-500 dark:text-amber-400" },
    { label: "Active Escalations", value: `${metrics.escalationsCount} Escalated`, icon: AlertTriangle, color: "text-rose-500 dark:text-rose-400" },
    { label: "Primary SLA Bottleneck", value: metrics.bottleneckStage.replace("_", " "), icon: ShieldCheck, color: "text-blue-500 dark:text-blue-400" },
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
