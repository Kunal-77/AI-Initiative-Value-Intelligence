"use client";

import React from "react";
import { DollarSign, TrendingUp, PieChart, ShieldCheck, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { ExecutiveFinancialMetrics } from "../../types/financial";
import { Skeleton, SpotlightCard } from "../ui";

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
          <div key={idx} className="p-5 rounded-xl border border-[#202630] bg-[#11151C] space-y-3 shadow-2xs">
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
      accent: "text-emerald-400",
    },
    {
      title: "Actual Portfolio Spend",
      value: `$${(metrics.totalActualSpend / 1000000).toFixed(2)}M`,
      change: `${metrics.budgetVariancePercentage}% under budget`,
      isPositive: true,
      subtext: `budget $${(metrics.totalPlannedInvestment / 1000000).toFixed(2)}M`,
      icon: Wallet,
      accent: "text-[#F4F1EA]",
    },
    {
      title: "Portfolio Net ROI",
      value: `${metrics.overallPortfolioRoi}%`,
      change: "+28% YOY",
      isPositive: true,
      subtext: "Risk-adjusted capital return",
      icon: DollarSign,
      accent: "text-[#7DA7D9]",
    },
    {
      title: "Net Value Creation",
      value: `$${((metrics.totalRealizedBenefit - metrics.totalActualSpend) / 1000000).toFixed(2)}M`,
      change: "100% Realized",
      isPositive: true,
      subtext: "Audited financial net creation",
      icon: PieChart,
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          const isGold = idx === 1;
          return (
            <SpotlightCard
              key={idx}
              tiltEnabled={true}
              spotlightColor={isGold ? "rgba(201, 168, 106, 0.14)" : "rgba(125, 167, 217, 0.14)"}
              className="p-5 rounded-xl border-[#202630] bg-[#11151C]/95 flex flex-col justify-between gap-3 hover:border-[#7DA7D9]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8F98A8]">
                  {c.title}
                </span>
                <div className={`p-2 rounded-lg border ${
                  isGold 
                    ? "bg-[#C9A86A]/10 border-[#C9A86A]/20 text-[#C9A86A]" 
                    : "bg-[#7DA7D9]/10 border-[#7DA7D9]/20 text-[#7DA7D9]"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 pt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight block text-[#F4F1EA]">
                  {c.value}
                </span>

                <span className="inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {c.change}
                </span>
              </div>

              <p className="text-[11px] text-[#8F98A8] truncate border-t border-[#202630] pt-2 mt-1 font-medium">
                {c.subtext}
              </p>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Top Cost Driver & Savings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-[#11151C] border border-[#202630] flex items-center justify-between text-xs">
          <span className="text-[#8F98A8] font-mono text-[11px]">Top Cost Driver:</span>
          <span className="font-bold text-[#F4F1EA] truncate max-w-xs">{metrics.topCostDriver}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 flex items-center justify-between text-xs">
          <span className="text-[#7DA7D9] font-mono text-[11px] font-semibold">Largest Value Realization:</span>
          <span className="font-bold text-[#F4F1EA] truncate max-w-xs">{metrics.largestSavingInitiative}</span>
        </div>
      </div>
    </div>
  );
}
