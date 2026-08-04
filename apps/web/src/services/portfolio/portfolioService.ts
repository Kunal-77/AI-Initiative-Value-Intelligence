/**
 * Portfolio Command Center Service Layer
 * Interface mapping cleanly to FastAPI analytics endpoints.
 */

import {
  ExecutiveCommandCenterMetrics,
  PortfolioAlert,
  DepartmentBenchmark,
  PredictiveInsight,
} from "../../types/portfolio";
import { generatePredictiveInsights } from "../../lib/portfolio/analyticsEngine";

export const MOCK_EXECUTIVE_ALERTS: PortfolioAlert[] = [
  {
    id: "alt_1",
    title: "NVIDIA A100 GPU Spot Price Spike Warning",
    category: "BUDGET",
    severity: "HIGH",
    timestamp: "10m ago",
    initiativeName: "Customer Support Automation",
    actionRequired: "Review serverless batch fallback configuration.",
  },
  {
    id: "alt_2",
    title: "SOC2 Compliance Sign-off Gate Milestone",
    category: "APPROVAL",
    severity: "MEDIUM",
    timestamp: "1h ago",
    initiativeName: "Automated Document Processing",
    actionRequired: "Executive Sponsor signature required.",
  },
  {
    id: "alt_3",
    title: "Support Bot Deflection Target Surpassed (+12%)",
    category: "AI_SIGNAL",
    severity: "LOW",
    timestamp: "3h ago",
    initiativeName: "Customer Support Automation",
    actionRequired: "Update baseline metrics target in AI Studio.",
  },
];

export const MOCK_DEPARTMENT_BENCHMARKS: DepartmentBenchmark[] = [
  {
    department: "Operations & Care",
    businessUnit: "Global Operations",
    initiativeCount: 4,
    budget: 850000,
    actualSpend: 780000,
    realizedRoi: 245,
    healthScore: 94,
    aiAdoptionPercentage: 88,
    isBestPerformer: true,
  },
  {
    department: "Software Engineering",
    businessUnit: "Technology Group",
    initiativeCount: 5,
    budget: 1200000,
    actualSpend: 1100000,
    realizedRoi: 210,
    healthScore: 89,
    aiAdoptionPercentage: 92,
  },
  {
    department: "Legal & Compliance",
    businessUnit: "Corporate Governance",
    initiativeCount: 3,
    budget: 450000,
    actualSpend: 420000,
    realizedRoi: 165,
    healthScore: 82,
    aiAdoptionPercentage: 65,
  },
];

export async function getCommandCenterMetrics(): Promise<ExecutiveCommandCenterMetrics> {
  return {
    portfolioHealthScore: 92,
    portfolioRoiPercentage: 215,
    portfolioActualSpend: 2330000,
    budgetUtilizationPercentage: 80.3,
    valueDeliveredAmount: 4940000,
    valueAtRiskAmount: 180000,
    aiPortfolioScore: 94,
    openExecutiveDecisionsCount: 3,
  };
}

export async function getExecutiveAlerts(): Promise<PortfolioAlert[]> {
  return MOCK_EXECUTIVE_ALERTS;
}

export async function getDepartmentBenchmarks(): Promise<DepartmentBenchmark[]> {
  return MOCK_DEPARTMENT_BENCHMARKS;
}

export async function getPredictiveAnalysis(): Promise<PredictiveInsight[]> {
  return generatePredictiveInsights(12, 2330000);
}
