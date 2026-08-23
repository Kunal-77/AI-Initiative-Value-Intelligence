"use client";

import React from "react";
import { TrendingUp, Target, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Skeleton, EmptyState, ErrorBanner } from "../ui";
import { cn } from "../ui/cn";

export interface RoiSummaryCardProps {
  loading?: boolean;
  error?: string | null;
}

export function RoiSummaryCard({ loading = false, error = null }: RoiSummaryCardProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load ROI summary: ${error}`} variant="red" />;
  }

  const roiMetrics = [
    { label: "Planned Target ROI", value: "210%", target: "Base threshold" },
    { label: "Realized ROI To Date", value: "284%", target: "+74% over plan" },
    { label: "Net Financial Benefit", value: "$3.03M", target: "Net of all costs" },
  ];

  return (
    <div className="p-6 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-5 hover:border-blue-500/30 transition-all duration-200 motion-reveal motion-hover-lift">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            ROI & Financial Impact Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Aggregated return on investment across active B2B AI initiatives.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
          Exceeding Target
        </span>
      </div>

      {/* Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roiMetrics.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-secondary/35 border border-border/70 hover:border-blue-500/30 transition-all space-y-1 min-w-0 motion-hover-lift">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate block" title={item.label}>
              {item.label}
            </span>
            <div className="text-xl font-bold font-mono text-foreground motion-number-reveal">{item.value}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.target}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
          <span>Portfolio Target Progress</span>
          <span className="text-foreground font-mono">135.2% achieved</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[85%] motion-draw" />
        </div>
      </div>
    </div>
  );
}
