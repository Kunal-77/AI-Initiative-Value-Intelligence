"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, Activity } from "lucide-react";
import { Skeleton, ErrorBanner } from "../ui";

export interface PortfolioHealthCardProps {
  loading?: boolean;
  error?: string | null;
}

export function PortfolioHealthCard({ loading = false, error = null }: PortfolioHealthCardProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load portfolio health: ${error}`} variant="red" />;
  }

  const healthItems = [
    {
      title: "Healthy & On Track",
      count: 9,
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
      desc: "Meeting baseline ROI & metric targets",
    },
    {
      title: "Cost Variance Risk",
      count: 3,
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: AlertTriangle,
      desc: "Actual spend exceeds planned budget by >10%",
    },
    {
      title: "Pending Baseline Review",
      count: 2,
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: HelpCircle,
      desc: "Awaiting executive sign-off on targets",
    },
  ];

  return (
    <div className="p-6 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-5 hover:border-blue-500/30 transition-all duration-200 motion-reveal motion-hover-lift">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            Portfolio Risk & Health Overview
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of initiative operational health status across the enterprise.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          14 Initiatives Total
        </span>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
        {healthItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-secondary/35 border border-border/70 hover:border-blue-500/30 transition-all space-y-2 min-w-0 motion-hover-lift">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground truncate" title={item.title}>
                  {item.title}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 motion-number-reveal ${item.badgeClass}`}>
                  {item.count}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
