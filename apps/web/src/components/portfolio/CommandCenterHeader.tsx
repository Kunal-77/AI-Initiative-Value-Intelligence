"use client";

import React from "react";
import { Sparkles, ShieldCheck, DollarSign, TrendingUp, AlertTriangle, PieChart, Layers, Clock } from "lucide-react";
import { ExecutiveCommandCenterMetrics } from "../../types/portfolio";

export interface CommandCenterHeaderProps {
  metrics: ExecutiveCommandCenterMetrics;
}

export function CommandCenterHeader({ metrics }: CommandCenterHeaderProps) {
  const cards = [
    { label: "Portfolio Health", value: `${metrics.portfolioHealthScore}/100`, icon: ShieldCheck, color: "text-emerald-500", subtext: "Composite health index" },
    { label: "Portfolio ROI", value: `${metrics.portfolioRoiPercentage}%`, icon: TrendingUp, color: "text-accent", subtext: "Audited ROI return" },
    { label: "Actual Spend", value: `$${(metrics.portfolioActualSpend / 1000000).toFixed(2)}M`, icon: DollarSign, color: "text-foreground", subtext: "Capital expenditure" },
    { label: "Budget Utilization", value: `${metrics.budgetUtilizationPercentage}%`, icon: PieChart, color: "text-foreground", subtext: "Of allocated funds" },
    { label: "Value Delivered", value: `$${(metrics.valueDeliveredAmount / 1000000).toFixed(2)}M`, icon: Sparkles, color: "text-emerald-500", subtext: "Realized benefit total" },
    { label: "Value at Risk", value: `$${(metrics.valueAtRiskAmount / 1000).toFixed(0)}k`, icon: AlertTriangle, color: "text-rose-500", subtext: "Identified exposure" },
    { label: "AI Portfolio Score", value: `${metrics.aiPortfolioScore}/100`, icon: Layers, color: "text-accent", subtext: "Maturity & adoption" },
    { label: "Open Decisions", value: `${metrics.openExecutiveDecisionsCount} Pending`, icon: Clock, color: "text-amber-500", subtext: "Action items" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-1 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>

            <span className={`text-base font-extrabold font-mono tracking-tight block ${c.color}`}>
              {c.value}
            </span>

            <p className="text-[9px] text-muted-foreground truncate">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
