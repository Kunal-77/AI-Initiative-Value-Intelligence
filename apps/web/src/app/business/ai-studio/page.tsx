"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import {
  AppHeader,
  AiStudioHeader,
  AiScorecard,
  ExecutiveInsightCards,
  PortfolioRiskOverview,
  FinancialProjections,
  RecommendationHistory,
  AiStudioExport,
  SkeletonMetricsRow,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonChart,
  SkeletonTable,
  SkeletonCard,
} from "../../../components/ui";

const RecommendationFeed = dynamic(
  () => import("../../../components/ai/RecommendationFeed").then(mod => mod.RecommendationFeed),
  { loading: () => <SkeletonTable rows={3} /> }
);
const RoiTrendChart = dynamic(
  () => import("../../../components/ai/AiCharts").then(mod => mod.RoiTrendChart),
  { loading: () => <SkeletonChart /> }
);
const CostVsBenefitChart = dynamic(
  () => import("../../../components/ai/AiCharts").then(mod => mod.CostVsBenefitChart),
  { loading: () => <SkeletonChart /> }
);
const ScenarioComparison = dynamic(
  () => import("../../../components/ai/ScenarioComparison").then(mod => mod.ScenarioComparison),
  { loading: () => <SkeletonCard /> }
);
const ExplainabilityPanel = dynamic(
  () => import("../../../components/ai/ExplainabilityPanel").then(mod => mod.ExplainabilityPanel),
  { ssr: false }
);
import { defaultAiEngine } from "../../../services/ai/aiEngine";
import { AiAnalysisResult, AiRecommendation, RecommendationStatus } from "../../../types/ai";
import { getStoredInitiatives } from "../../../lib/initiativeStore";

export default function BusinessAiStudioPage() {
  const { getToken, orgId } = useAuth();

  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [selectedExplainability, setSelectedExplainability] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadAiData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const storedInits = token ? await getStoredInitiatives(token) : [];
      const firstInit = storedInits[0] || { id: "init_cs_auto", name: "Customer Support Automation" };

      const result = await defaultAiEngine.analyzeInitiative(firstInit);
      const recs = await defaultAiEngine.getRecommendations();

      setAnalysis(result);
      setRecommendations(recs);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadAiData();
    }
  }, [orgId]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const token = await getToken();
      const storedInits = token ? await getStoredInitiatives(token) : [];
      const firstInit = storedInits[0] || { id: "init_cs_auto" };
      const result = await defaultAiEngine.analyzeInitiative(firstInit);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusChange = (rec: AiRecommendation, newStatus: RecommendationStatus) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, status: newStatus } : r))
    );
  };

  const scorecardData = useMemo(() => {
    if (analysis?.scorecard) {
      const pendingCount = recommendations.filter((r) => r.status === "PENDING").length;
      return {
        ...analysis.scorecard,
        awaitingDecisionCount: pendingCount,
      };
    }
    return {
      portfolioAiScore: 92,
      averageConfidence: 91,
      portfolioRiskLevel: "Medium" as const,
      estimatedAnnualSavings: 320000,
      averageRoi: 215,
      averagePaybackMonths: 5.6,
      awaitingDecisionCount: recommendations.filter((r) => r.status === "PENDING").length,
    };
  }, [analysis, recommendations]);

  if (!orgId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="AI Value Studio" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader badge="AI Value Studio" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="ai" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. AI Studio Header Banner */}
        <AiStudioHeader
          engineProvider={analysis?.engineProvider || defaultAiEngine.providerName}
          isAnalyzing={analyzing}
          onRunAnalysis={handleRunAnalysis}
        />

        {/* 2. Executive Scorecard Summary Bar */}
        <AiScorecard scorecard={scorecardData} />

        {/* 3. Executive Highlight Cards */}
        <ExecutiveInsightCards recommendations={recommendations} />

        {/* 4. Main Grid: Recommendations & Financials (Left 8) | Risk Engine & Visuals (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* ROI & Financial Projections */}
            <FinancialProjections financials={analysis?.financials} />

            {/* AI Executive Recommendations Feed & Interactive Decision Center */}
            <RecommendationFeed
              recommendations={recommendations}
              loading={loading}
              onSelectExplainability={(rec) => setSelectedExplainability(rec)}
              onAccept={(rec) => handleStatusChange(rec, "ACCEPTED")}
              onReject={(rec) => handleStatusChange(rec, "REJECTED")}
              onStatusChange={handleStatusChange}
            />

            {/* 4-Scenario What-If Executive Comparison */}
            <ScenarioComparison />

            {/* Executive AI Report Export Triggers */}
            <AiStudioExport />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Reusable Visual Charts */}
            <RoiTrendChart />
            <CostVsBenefitChart />

            {/* Portfolio Risk Engine Overview */}
            <PortfolioRiskOverview risks={analysis?.risks} />

            {/* AI Recommendation Decision Stream */}
            <RecommendationHistory history={recommendations} />
          </div>
        </div>
      </main>

      {/* Expanded Deep-Dive Explainability Panel Modal */}
      <ExplainabilityPanel
        isOpen={!!selectedExplainability}
        recommendation={selectedExplainability}
        onClose={() => setSelectedExplainability(null)}
        onAccept={(rec) => handleStatusChange(rec, "ACCEPTED")}
        onReject={(rec) => handleStatusChange(rec, "REJECTED")}
      />
    </div>
  );
}
