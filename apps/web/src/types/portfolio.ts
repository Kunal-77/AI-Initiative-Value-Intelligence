/**
 * Strongly Typed Interfaces for Portfolio Analytics & Executive Reporting Platform
 * Single Source of Truth for Command Center, Multi-Dimensional Analytics, Predictive Intelligence & Benchmarking.
 */

export type AlertSeverity = "HIGH" | "MEDIUM" | "LOW";
export type AlertCategory = "BUDGET" | "RISK" | "MILESTONE" | "APPROVAL" | "AI_SIGNAL";

export interface ExecutiveCommandCenterMetrics {
  portfolioHealthScore: number; // 0-100
  portfolioRoiPercentage: number;
  portfolioActualSpend: number;
  budgetUtilizationPercentage: number;
  valueDeliveredAmount: number;
  valueAtRiskAmount: number;
  aiPortfolioScore: number; // 0-100
  openExecutiveDecisionsCount: number;
}

export interface PortfolioAlert {
  id: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  timestamp: string;
  initiativeName: string;
  actionRequired: string;
}

export interface DepartmentBenchmark {
  department: string;
  businessUnit: string;
  initiativeCount: number;
  budget: number;
  actualSpend: number;
  realizedRoi: number;
  healthScore: number;
  aiAdoptionPercentage: number;
  isBestPerformer?: boolean;
}

export interface PredictiveInsight {
  id: string;
  title: string;
  type: "BUDGET_OVERRUN" | "SCHEDULE_DELAY" | "RESOURCE_BOTTLENECK" | "ATTENTION_REQUIRED";
  impactDescription: string;
  confidenceScore: number; // 0-100
  predictedSeverity: "High" | "Medium" | "Low";
  recommendedMitigation: string;
}

export interface GlobalPortfolioFilters {
  businessUnit: string;
  businessArea: string;
  department: string;
  status: string;
  riskLevel: string;
  dateRange: string;
  searchQuery: string;
}

export interface ExecutiveReportConfig {
  reportType: "BOARD_REPORT" | "CEO_BRIEFING" | "CFO_AUDIT" | "CIO_TECH" | "QBR" | "RISK_SUMMARY";
  format: "PDF" | "PPT" | "CSV";
  dateRange: string;
}
