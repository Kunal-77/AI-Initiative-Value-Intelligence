"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import {
  AppHeader,
  ExecutiveFinancialSummary,
  ValueDriversCard,
  FinancialExport,
  SkeletonMetricsRow,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonChart,
  SkeletonTable,
  SkeletonCard,
} from "../../../components/ui";

const FinancialForecastsCard = dynamic(
  () => import("../../../components/financial/FinancialForecastsCard").then(mod => mod.FinancialForecastsCard),
  { loading: () => <SkeletonCard /> }
);
const BenefitsRealization = dynamic(
  () => import("../../../components/financial/BenefitsRealization").then(mod => mod.BenefitsRealization),
  { loading: () => <SkeletonChart /> }
);
const CostManagementCard = dynamic(
  () => import("../../../components/financial/CostManagementCard").then(mod => mod.CostManagementCard),
  { loading: () => <SkeletonCard /> }
);
const BenefitsRegister = dynamic(
  () => import("../../../components/financial/BenefitsRegister").then(mod => mod.BenefitsRegister),
  { loading: () => <SkeletonTable rows={4} /> }
);
const CostRegister = dynamic(
  () => import("../../../components/financial/CostRegister").then(mod => mod.CostRegister),
  { loading: () => <SkeletonTable rows={4} /> }
);
const CashFlowCharts = dynamic(
  () => import("../../../components/financial/CashFlowCharts").then(mod => mod.CashFlowCharts),
  { loading: () => <SkeletonChart /> }
);
import {
  getExecutiveFinancialMetrics,
  getBenefitsRegister,
  getCostsLedger,
} from "../../../services/financial/financialService";
import {
  ExecutiveFinancialMetrics,
  BenefitItem,
  CostItemLedger,
} from "../../../types/financial";

export default function BusinessFinancialsPage() {
  const { orgId, getToken } = useAuth();

  const [metrics, setMetrics] = useState<ExecutiveFinancialMetrics | undefined>(undefined);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [costs, setCosts] = useState<CostItemLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      setLoading(true);
      getToken().then((token) => {
        if (!token) return;
        Promise.all([
          getExecutiveFinancialMetrics(token),
          getBenefitsRegister(token),
          getCostsLedger(token),
        ])
          .then(([m, b, c]) => {
            setMetrics(m);
            setBenefits(b);
            setCosts(c);
          })
          .catch((err) => console.error("Failed to fetch financials:", err))
          .finally(() => setLoading(false));
      });
    }
  }, [orgId]);

  if (!orgId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Financial Intelligence" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader badge="Financial Intelligence" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="financials" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. Executive Summary & Health */}
        <ExecutiveFinancialSummary metrics={metrics} loading={loading} />

        {/* 2. 4-Scenario Financial Forecast Valuation */}
        <FinancialForecastsCard
          actualSpend={metrics?.totalActualSpend}
          realizedBenefit={metrics?.totalRealizedBenefit}
        />

        {/* 3. Main Grid: Benefits & Costs (Left 8) | Cash Flow & Drivers (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Benefits Realization Trend */}
            <BenefitsRealization
              expectedBenefit={metrics?.totalExpectedBenefit}
              realizedBenefit={metrics?.totalRealizedBenefit}
            />

            {/* CAPEX vs OPEX Cost Management */}
            <CostManagementCard />

            {/* Enterprise Benefits Register */}
            <BenefitsRegister benefits={benefits} />

            {/* Enterprise Cost Ledger */}
            <CostRegister costs={costs} />

            {/* Financial Export */}
            <FinancialExport />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Cumulative Cash Flow & Break-even Curve */}
            <CashFlowCharts
              actualSpend={metrics?.totalActualSpend}
              realizedBenefit={metrics?.totalRealizedBenefit}
            />

            {/* Strategic Value Drivers */}
            <ValueDriversCard />
          </div>
        </div>
      </main>
    </div>
  );
}
