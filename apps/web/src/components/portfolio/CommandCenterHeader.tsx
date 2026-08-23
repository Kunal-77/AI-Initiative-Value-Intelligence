"use client";

import React from "react";
import { Sparkles, ShieldCheck, DollarSign, TrendingUp, AlertTriangle, PieChart, Layers, Clock } from "lucide-react";
import { ExecutiveCommandCenterMetrics } from "../../types/portfolio";

export interface CommandCenterHeaderProps {
  metrics: ExecutiveCommandCenterMetrics | null;
  loading?: boolean;
}

export function CommandCenterHeader({ metrics, loading = false }: CommandCenterHeaderProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs space-y-2 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-secondary/80 rounded" />
              <div className="h-3.5 w-3.5 bg-secondary/80 rounded" />
            </div>
            <div className="h-5 w-12 bg-secondary/80 rounded" />
            <div className="h-2 w-16 bg-secondary/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Portfolio Health", value: `${metrics.portfolioHealthScore}/100`, icon: ShieldCheck, color: "text-emerald-500 dark:text-emerald-400", subtext: "Composite health index" },
    { label: "Portfolio ROI", value: `${metrics.portfolioRoiPercentage}%`, icon: TrendingUp, color: "text-blue-500 dark:text-blue-400", subtext: "Audited ROI return" },
    { label: "Actual Spend", value: `$${(metrics.portfolioActualSpend / 1000000).toFixed(2)}M`, icon: DollarSign, color: "text-foreground", subtext: "Capital expenditure" },
    { label: "Budget Utilization", value: `${metrics.budgetUtilizationPercentage}%`, icon: PieChart, color: "text-foreground", subtext: "Of allocated funds" },
    { label: "Value Delivered", value: `$${(metrics.valueDeliveredAmount / 1000000).toFixed(2)}M`, icon: Sparkles, color: "text-emerald-500 dark:text-emerald-400", subtext: "Realized benefit total" },
    { label: "Value at Risk", value: `$${(metrics.valueAtRiskAmount / 1000).toFixed(0)}k`, icon: AlertTriangle, color: "text-rose-500 dark:text-rose-400", subtext: "Identified exposure" },
    { label: "AI Portfolio Score", value: `${metrics.aiPortfolioScore}/100`, icon: Layers, color: "text-cyan-500 dark:text-cyan-400", subtext: "Maturity & adoption" },
    { label: "Open Decisions", value: `${metrics.openExecutiveDecisionsCount} Pending`, icon: Clock, color: "text-amber-500 dark:text-amber-400", subtext: "Action items" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs space-y-1 hover:border-blue-500/40 hover:shadow-xs transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>

            <span className={`text-base sm:text-lg font-extrabold font-mono tracking-tight block ${c.color}`}>
              {c.value}
            </span>

            <p className="text-[9px] text-muted-foreground truncate">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
