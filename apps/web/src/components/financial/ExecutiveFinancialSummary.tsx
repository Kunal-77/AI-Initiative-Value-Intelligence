"use client";

import React from "react";
import { DollarSign, TrendingUp, PieChart, ShieldCheck, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { ExecutiveFinancialMetrics } from "../../types/financial";
import { Skeleton } from "../ui";

export interface ExecutiveFinancialSummaryProps {
  metrics?: ExecutiveFinancialMetrics;
  loading?: boolean;
}

const DEFAULT_METRICS: ExecutiveFinancialMetrics = {
  totalPlannedInvestment: 2900000,
  totalActualSpend: 2330000,
  totalExpectedBenefit: 4850000,
  totalRealizedBenefit: 4940000,
  overallPortfolioRoi: 212,
  budgetVariancePercentage: -19.6,
  benefitRealizationPercentage: 101.8,
  topCostDriver: "GPU Cloud Inference Clusters ($265,000)",
  largestSavingInitiative: "Predictive Supply Chain Demand ($2,050,000)",
};

export function ExecutiveFinancialSummary({
  metrics = DEFAULT_METRICS,
  loading = false,
}: ExecutiveFinancialSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Realized Benefits",
      value: `$${(metrics.totalRealizedBenefit / 1000000).toFixed(2)}M`,
      change: `+${metrics.benefitRealizationPercentage}% target`,
      isPositive: true,
      subtext: `vs expected $${(metrics.totalExpectedBenefit / 1000000).toFixed(2)}M`,
      icon: TrendingUp,
      accent: "text-emerald-500",
    },
    {
      title: "Actual Portfolio Spend",
      value: `$${(metrics.totalActualSpend / 1000000).toFixed(2)}M`,
      change: `${metrics.budgetVariancePercentage}% under budget`,
      isPositive: true,
      subtext: `budget $${(metrics.totalPlannedInvestment / 1000000).toFixed(2)}M`,
      icon: Wallet,
      accent: "text-foreground",
    },
    {
      title: "Overall Portfolio ROI",
      value: `${metrics.overallPortfolioRoi}%`,
      change: "+18.4% YoY",
      isPositive: true,
      subtext: "Across 14 active AI initiatives",
      icon: DollarSign,
      accent: "text-accent",
    },
    {
      title: "Net Value Creation",
      value: `$${((metrics.totalRealizedBenefit - metrics.totalActualSpend) / 1000000).toFixed(2)}M`,
      change: "100% Realized",
      isPositive: true,
      subtext: "Audited financial net creation",
      icon: PieChart,
      accent: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs hover:shadow-lg hover:shadow-blue-950/20 hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.title}
                </span>
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 pt-1">
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight block ${c.accent}`}>
                  {c.value}
                </span>

                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {c.change}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground/80 truncate border-t border-border/50 pt-2 mt-1">
                {c.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Top Cost Driver & Savings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Top Cost Driver:</span>
          <span className="font-bold text-foreground truncate max-w-xs">{metrics.topCostDriver}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Largest Value Realization:</span>
          <span className="font-bold text-emerald-500 truncate max-w-xs">{metrics.largestSavingInitiative}</span>
        </div>
      </div>
    </div>
  );
}
