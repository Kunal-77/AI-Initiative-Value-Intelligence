"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Subscription, RenewalSchedule, SubscriptionCandidate } from "../../types/personal";

export interface SpendingInsightsCardProps {
  subscriptions: Subscription[];
  renewals: RenewalSchedule[];
  candidates?: SubscriptionCandidate[];
  monthlySpend?: number;
}

export function SpendingInsightsCard({
  subscriptions,
  renewals,
  candidates = [],
  monthlySpend = 0,
}: SpendingInsightsCardProps) {
  // Deterministic rule-based insights calculation
  const insights = useMemo(() => {
    if (subscriptions.length === 0) return null;

    // 1. Calculate highest recurring commitment
    const sortedByMonthly = [...subscriptions].map((s) => ({
      ...s,
      monthlyCost: s.billingCycle === "ANNUAL" ? s.costAmount / 12 : s.costAmount,
    })).sort((a, b) => b.monthlyCost - a.monthlyCost);

    const topCommitment = sortedByMonthly[0];

    // 2. Category with highest recurring spend
    const categoryTotals: Record<string, number> = {};
    subscriptions.forEach((s) => {
      let cat = s.category?.name || "General";
      if (s.subscriptionType === "ai") cat = "AI & Productivity";
      else if (s.subscriptionType === "cloud") cat = "Cloud Services";

      const cost = s.billingCycle === "ANNUAL" ? s.costAmount / 12 : s.costAmount;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost;
    });

    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : "General";
    const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;
    const topCategoryPct = monthlySpend > 0 ? Math.round((topCategoryAmount / monthlySpend) * 100) : 0;

    // 3. Yearly recurring estimate
    let yearlyEstimate = 0;
    subscriptions.forEach((s) => {
      if (s.billingCycle === "ANNUAL") {
        yearlyEstimate += s.costAmount;
      } else {
        yearlyEstimate += s.costAmount * 12;
      }
    });

    // 4. Renewals in next 30 days
    const renewalCount = renewals.length;
    const renewalSum = renewals.reduce((sum, r) => {
      const sub = subscriptions.find((s) => s.id === r.subscriptionId);
      return sum + (sub?.costAmount || 0);
    }, 0);

    // 5. Newly detected recurring candidates
    const pendingCandidatesCount = candidates.filter((c) => c.status === "PENDING").length;

    return {
      topCommitment,
      topCategoryName,
      topCategoryAmount,
      topCategoryPct,
      yearlyEstimate,
      renewalCount,
      renewalSum,
      pendingCandidatesCount,
    };
  }, [subscriptions, renewals, candidates, monthlySpend]);

  return (
    <div className="rounded-xl border border-[#202630] bg-[#11151C] shadow-md overflow-hidden flex flex-col space-y-4 p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#202630] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Deterministic Financial Insights</h3>
            <p className="text-[11px] text-[#8F98A8]">
              Automated mathematical patterns derived strictly from stored database records
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C24] border border-[#202630] text-[#8F98A8]">
          Zero AI Hallucinations
        </span>
      </div>

      {!insights ? (
        <div className="p-8 text-center text-xs text-[#8F98A8] border border-[#202630] rounded-xl bg-[#0E1116]">
          Register active subscriptions to generate deterministic financial insights and commitment analytics.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1: Highest Recurring Commitment */}
          <div className="p-4 rounded-xl border border-[#202630] bg-[#0E1116] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase text-[#8F98A8] whitespace-nowrap">Top Single Commitment</span>
              <span className="text-xs font-bold font-mono text-[#7DA7D9] whitespace-nowrap shrink-0">
                ${insights.topCommitment.monthlyCost.toFixed(2)}/mo
              </span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-[#F4F1EA] truncate">{insights.topCommitment.name}</h4>
              <p className="text-[11px] text-[#8F98A8] truncate">
                Billed {insights.topCommitment.billingCycle.toLowerCase()} (${insights.topCommitment.costAmount.toFixed(2)})
              </p>
            </div>
          </div>

          {/* Insight 2: Category Concentration */}
          <div className="p-4 rounded-xl border border-[#202630] bg-[#0E1116] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase text-[#8F98A8] whitespace-nowrap">Category Concentration</span>
              <span className="text-xs font-bold font-mono text-[#C9A86A] whitespace-nowrap shrink-0">{insights.topCategoryPct}% of spend</span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-[#F4F1EA] truncate">{insights.topCategoryName}</h4>
              <p className="text-[11px] text-[#8F98A8] truncate">
                Accounts for ${insights.topCategoryAmount.toFixed(2)}/mo of recurring cash flow
              </p>
            </div>
          </div>

          {/* Insight 3: 30-Day Renewal Pipeline */}
          <div className="p-4 rounded-xl border border-[#202630] bg-[#0E1116] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase text-[#8F98A8] whitespace-nowrap">30-Day Renewal Pipeline</span>
              <span className="text-xs font-bold font-mono text-emerald-400 whitespace-nowrap shrink-0">
                ${insights.renewalSum.toFixed(2)}
              </span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-[#F4F1EA] truncate">{insights.renewalCount} Upcoming Renewals</h4>
              <p className="text-[11px] text-[#8F98A8] truncate">
                Scheduled for execution within next 30 calendar days
              </p>
            </div>
          </div>

          {/* Insight 4: Annual Run-Rate Projection */}
          <div className="p-4 rounded-xl border border-[#202630] bg-[#0E1116] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase text-[#8F98A8] whitespace-nowrap">Annual Projected Run-Rate</span>
              <span className="text-xs font-bold font-mono text-[#F4F1EA] whitespace-nowrap shrink-0">
                ${insights.yearlyEstimate.toFixed(2)}/yr
              </span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-[#F4F1EA] truncate">
                ${(insights.yearlyEstimate / 12).toFixed(2)} Monthly Avg
              </h4>
              <p className="text-[11px] text-[#8F98A8] truncate">
                {insights.pendingCandidatesCount > 0
                  ? `${insights.pendingCandidatesCount} pending candidate(s) awaiting review`
                  : "All detected recurring subscriptions confirmed"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
