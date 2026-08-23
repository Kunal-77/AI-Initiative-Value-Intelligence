"use client";

import React from "react";
import { PieChart, DollarSign, Layers } from "lucide-react";
import { Skeleton, ErrorBanner } from "../ui";

export interface BudgetUtilizationCardProps {
  loading?: boolean;
  error?: string | null;
}

export function BudgetUtilizationCard({ loading = false, error = null }: BudgetUtilizationCardProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load budget utilization: ${error}`} variant="red" />;
  }

  const categoryBreakdown = [
    { name: "Cloud Compute (GPU/Inference)", spent: "$840,000", total: "$1,000,000", percentage: 84 },
    { name: "LLM Licenses & API Subscriptions", spent: "$620,000", total: "$800,000", percentage: 77.5 },
    { name: "Engineering & Integration", spent: "$360,000", total: "$530,000", percentage: 67.9 },
  ];

  return (
    <div className="p-6 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-5 hover:border-blue-500/30 transition-all duration-200 motion-reveal motion-hover-lift">
      <div className="flex flex-col 2xl:flex-row 2xl:items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 shrink-0">
              <PieChart className="w-4 h-4" />
            </div>
            <span className="truncate" title="Budget Allocation & Expenditure">Budget Allocation & Expenditure</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Current fiscal year expenditure across major investment categories.
          </p>
        </div>
        <div className="text-left 2xl:text-right shrink-0">
          <div className="text-sm font-bold font-mono text-foreground motion-number-reveal">$1.82M / $2.33M</div>
          <div className="text-[10px] text-muted-foreground">78.2% Utilized</div>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="space-y-3.5 pt-1">
        {categoryBreakdown.map((cat, idx) => (
          <div key={idx} className="space-y-1.5 min-w-0">
            <div className="flex justify-between text-xs gap-2">
              <span className="font-medium text-foreground truncate" title={cat.name}>{cat.name}</span>
              <span className="font-mono text-muted-foreground shrink-0">
                {cat.spent} <span className="text-muted-foreground/60">/ {cat.total}</span>
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 motion-draw"
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
