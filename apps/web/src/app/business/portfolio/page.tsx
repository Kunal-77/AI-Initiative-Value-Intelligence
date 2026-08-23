"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import {
  AppHeader,
  CommandCenterHeader,
  GlobalPortfolioFilter,
  SkeletonMetricsRow,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonChart,
  SkeletonTimeline,
  SkeletonTable,
  SkeletonCard,
} from "../../../components/ui";

const PortfolioVisualizations = dynamic(
  () => import("../../../components/portfolio/PortfolioVisualizations").then(mod => mod.PortfolioVisualizations),
  { loading: () => <SkeletonChart /> }
);
const PortfolioDrillDown = dynamic(
  () => import("../../../components/portfolio/PortfolioDrillDown").then(mod => mod.PortfolioDrillDown),
  { loading: () => <SkeletonTable rows={4} /> }
);
const ExecutiveAlertCenter = dynamic(
  () => import("../../../components/portfolio/ExecutiveAlertCenter").then(mod => mod.ExecutiveAlertCenter),
  { loading: () => <SkeletonCard /> }
);
const BenchmarkingCard = dynamic(
  () => import("../../../components/portfolio/BenchmarkingCard").then(mod => mod.BenchmarkingCard),
  { loading: () => <SkeletonCard /> }
);
const PredictiveAnalyticsCard = dynamic(
  () => import("../../../components/portfolio/PredictiveAnalyticsCard").then(mod => mod.PredictiveAnalyticsCard),
  { loading: () => <SkeletonCard /> }
);
const ExecutiveReportsModule = dynamic(
  () => import("../../../components/portfolio/ExecutiveReportsModule").then(mod => mod.ExecutiveReportsModule),
  { loading: () => <SkeletonCard /> }
);
const UnifiedExecutiveTimeline = dynamic(
  () => import("../../../components/integration/UnifiedExecutiveTimeline").then(mod => mod.UnifiedExecutiveTimeline),
  { loading: () => <SkeletonTimeline /> }
);
const GlobalActivityCenter = dynamic(
  () => import("../../../components/integration/GlobalActivityCenter").then(mod => mod.GlobalActivityCenter),
  { loading: () => <SkeletonTimeline /> }
);

import {
  getCommandCenterMetrics,
  getExecutiveAlerts,
  getDepartmentBenchmarks,
  getPredictiveAnalysis,
} from "../../../services/portfolio/portfolioService";
import {
  getUnifiedTimelineEvents,
} from "../../../services/integration/integrationService";
import {
  ExecutiveCommandCenterMetrics,
  PortfolioAlert,
  DepartmentBenchmark,
  PredictiveInsight,
  GlobalPortfolioFilters,
} from "../../../types/portfolio";
import { UnifiedTimelineEvent } from "../../../types/integration";

export default function BusinessPortfolioPage() {
  const { orgId } = useAuth();

  const [metrics, setMetrics] = useState<ExecutiveCommandCenterMetrics | null>(null);
  const [alerts, setAlerts] = useState<PortfolioAlert[]>([]);
  const [benchmarks, setBenchmarks] = useState<DepartmentBenchmark[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<UnifiedTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<GlobalPortfolioFilters>({
    businessUnit: "ALL",
    businessArea: "ALL",
    department: "ALL",
    status: "ALL",
    riskLevel: "ALL",
    dateRange: "Q3_2026",
    searchQuery: "",
  });

  useEffect(() => {
    if (orgId) {
      setLoading(true);
      Promise.all([
        getCommandCenterMetrics(),
        getExecutiveAlerts(),
        getDepartmentBenchmarks(),
        getPredictiveAnalysis(),
        getUnifiedTimelineEvents(),
      ])
        .then(([m, a, b, i, t]) => {
          setMetrics(m);
          setAlerts(a);
          setBenchmarks(b);
          setInsights(i);
          setTimelineEvents(t);
        })
        .finally(() => setLoading(false));
    }
  }, [orgId]);

  if (!orgId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Executive Command Center" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader badge="Executive Command Center" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="portfolio" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. Top Executive Command Center KPI Bar */}
        <CommandCenterHeader metrics={metrics} loading={loading} />

        {/* 2. Global Multi-Dimensional Filters */}
        <GlobalPortfolioFilter
          filters={filters}
          onChange={(updated) => setFilters(updated)}
          onReset={() =>
            setFilters({
              businessUnit: "ALL",
              businessArea: "ALL",
              department: "ALL",
              status: "ALL",
              riskLevel: "ALL",
              dateRange: "Q3_2026",
              searchQuery: "",
            })
          }
        />

        {/* 3. Main Command Center Grid: Analytics & Hierarchical Drill-down (Left 8) | Alerts & Benchmarks (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Advanced Visualization Charts Suite */}
            <PortfolioVisualizations />

            {/* Phase 7: Unified Executive Chronological Timeline */}
            <UnifiedExecutiveTimeline events={timelineEvents} />

            {/* Hierarchical Portfolio Drill-Down Explorer */}
            <PortfolioDrillDown />

            {/* C-Suite Executive Board Report Generator */}
            <ExecutiveReportsModule />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Phase 7: Global Enterprise Activity Stream */}
            <GlobalActivityCenter events={timelineEvents} />

            {/* Live Executive Priority Notification Alerts Stream */}
            <ExecutiveAlertCenter alerts={alerts} />

            {/* Predictive Portfolio Risk Forecasting */}
            <PredictiveAnalyticsCard insights={insights} />

            {/* Cross-Departmental Benchmarking */}
            <BenchmarkingCard benchmarks={benchmarks} />
          </div>
        </div>
      </main>
    </div>
  );
}
