/**
 * Portfolio Analytics & Prediction Engine
 * Independent pure TypeScript analytics utilities.
 */

import { DepartmentBenchmark, PredictiveInsight, GlobalPortfolioFilters } from "../../types/portfolio";

export function calculatePortfolioHealthIndex(
  onTrackPercentage: number,
  roiAchievement: number,
  budgetUtilization: number
): number {
  const score = onTrackPercentage * 0.4 + roiAchievement * 0.4 + (100 - Math.abs(100 - budgetUtilization)) * 0.2;
  return Math.min(Math.max(Math.round(score), 0), 100);
}

export function rankDepartmentPerformance(benchmarks: DepartmentBenchmark[]): {
  ranked: DepartmentBenchmark[];
  bestPerformer: DepartmentBenchmark | null;
  worstPerformer: DepartmentBenchmark | null;
} {
  const sorted = [...benchmarks].sort((a, b) => b.realizedRoi - a.realizedRoi);
  const updated = sorted.map((b, idx) => ({
    ...b,
    isBestPerformer: idx === 0,
  }));

  return {
    ranked: updated,
    bestPerformer: updated[0] || null,
    worstPerformer: updated[updated.length - 1] || null,
  };
}

export function generatePredictiveInsights(
  initiativesCount: number,
  totalSpend: number
): PredictiveInsight[] {
  return [
    {
      id: "pred_1",
      title: "Potential GPU Cloud Overrun in Q4",
      type: "BUDGET_OVERRUN",
      impactDescription: "LLM inference traffic trajectory indicates a +$65,000 budget variance if unoptimized.",
      confidenceScore: 89,
      predictedSeverity: "High",
      recommendedMitigation: "Enforce off-peak batch session scaling via Dataproc auto-scaler.",
    },
    {
      id: "pred_2",
      title: "Contract Processing Schedule Bottleneck",
      type: "SCHEDULE_DELAY",
      impactDescription: "SOC2 PII data masking validation delay may shift milestone gate by 14 days.",
      confidenceScore: 92,
      predictedSeverity: "Medium",
      recommendedMitigation: "Assign dedicated InfoSec compliance reviewer to accelerate sign-off.",
    },
    {
      id: "pred_3",
      title: "MLOps Engineering Staffing Capacity",
      type: "RESOURCE_BOTTLENECK",
      impactDescription: "2 senior MLOps engineers allocated across 5 parallel active initiatives.",
      confidenceScore: 84,
      predictedSeverity: "High",
      recommendedMitigation: "Reallocate Slalom consulting staff to lead document pipeline integration.",
    },
  ];
}

export function filterPortfolioData<T extends { name?: string; title?: string; businessArea?: string; department?: string }>(
  items: T[],
  filters: GlobalPortfolioFilters
): T[] {
  return items.filter((item) => {
    const q = filters.searchQuery.toLowerCase();
    if (q) {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchArea = item.businessArea?.toLowerCase().includes(q);
      const matchDept = item.department?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchArea && !matchDept) return false;
    }

    if (filters.businessArea !== "ALL" && item.businessArea && item.businessArea !== filters.businessArea) {
      return false;
    }

    return true;
  });
}
