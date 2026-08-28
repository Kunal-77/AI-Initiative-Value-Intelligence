import React from "react";
import { ExecutiveWelcome } from "./ExecutiveWelcome";
import { PortfolioKpiCards } from "./PortfolioKpiCards";
import { RoiSummaryCard } from "./RoiSummaryCard";
import { BudgetUtilizationCard } from "./BudgetUtilizationCard";
import { PortfolioHealthCard } from "./PortfolioHealthCard";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { ActiveInitiativesGrid } from "./ActiveInitiativesGrid";
import { RecentActivityTimeline } from "./RecentActivityTimeline";
import { AiInsightsPanel } from "./AiInsightsPanel";
import { UpcomingMilestonesCard } from "./UpcomingMilestonesCard";

export interface ExecutiveDashboardProps {
  orgName?: string;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
  onNewInitiative?: () => void;
  onRunAiStudio?: () => void;
}

export function ExecutiveDashboard({
  orgName = "Acme Enterprise Solutions",
  loading = false,
  empty = false,
  error = null,
  onNewInitiative,
  onRunAiStudio,
}: ExecutiveDashboardProps) {
  return (
    <div className="space-y-6 max-w-[1536px] mx-auto w-full">
      {/* 1. Executive Welcome Header */}
      <ExecutiveWelcome
        orgName={orgName}
        loading={loading}
        error={error}
        onNewInitiative={onNewInitiative}
        onRunAiStudio={onRunAiStudio}
      />

      {/* 2. Portfolio KPI Summary Cards */}
      <PortfolioKpiCards
        loading={loading}
        error={error}
        data={empty ? [] : undefined}
      />

      {/* 3. Main Data Area: Rebalanced 8-column & 4-column Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ROI Summary Card */}
          <RoiSummaryCard loading={loading} error={error} />

          {/* Strategic Initiatives Ledger Table */}
          <ActiveInitiativesGrid
            loading={loading}
            error={error}
            initiatives={empty ? [] : undefined}
            onNewInitiative={onNewInitiative}
          />

          {/* Portfolio Risk & Health Overview (Moved here to balance column heights) */}
          <PortfolioHealthCard loading={loading} error={error} />

          {/* Rich Activity & Audit Timeline */}
          <RecentActivityTimeline loading={loading} error={error} events={empty ? [] : undefined} />
        </div>

        {/* Executive Sidebar Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Decision Intelligence Panel */}
          <AiInsightsPanel loading={loading} error={error} insights={empty ? [] : undefined} />

          {/* Budget Allocation & Expenditure */}
          <BudgetUtilizationCard loading={loading} error={error} />

          {/* Upcoming Decision Gates & Milestones */}
          <UpcomingMilestonesCard loading={loading} error={error} milestones={empty ? [] : undefined} />

          {/* Executive Quick Actions */}
          <QuickActionsPanel
            loading={loading}
            error={error}
            onNewInitiative={onNewInitiative}
            onRunAiStudio={onRunAiStudio}
          />
        </div>
      </div>
    </div>
  );
}
