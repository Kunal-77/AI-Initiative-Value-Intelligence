/**
 * Strongly Typed Interfaces for AI Value Studio & Executive Decision Intelligence Workspace
 * Single Source of Truth for AI Recommendations, Scenarios, Risk Models, Explainability & Audit History.
 */

export type RecommendationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "SAVED"
  | "REVIEWED";

export interface DecisionHistoryItem {
  id: string;
  recommendationId: string;
  recommendationTitle: string;
  timestamp: string;
  decision: RecommendationStatus;
  executive: string;
  reason?: string;
  confidenceAtDecision: number;
}

export interface ExplainabilityDetails {
  businessDrivers: string[];
  financialDrivers: string[];
  technicalDrivers: string[];
  operationalImpact: string;
  complianceImpact: string;
  supportingMetrics: { name: string; value: string }[];
  modelWeightsBreakdown: { source: string; weight: number }[];
  limitations: string[];
  suggestedValidationSteps: string[];
}

export interface RiskScores {
  financialRisk: number; // 0-100
  deliveryRisk: number; // 0-100
  technologyRisk: number; // 0-100
  complianceRisk: number; // 0-100
  operationalRisk: number; // 0-100
  overallRiskLevel: "Low" | "Medium" | "High";
}

export interface FinancialForecast {
  plannedInvestment: number;
  expectedAnnualBenefit: number;
  netValueCreation: number;
  roiPercentage: number;
  paybackMonths: number;
  breakEvenMonth: number;
  mockNpv: number;
  mockIrr: number;
}

export interface AiRecommendation {
  id: string;
  initiativeId: string;
  initiativeName: string;
  businessArea: string;
  title: string;
  category: "Compute Optimization" | "Target Realignment" | "Model Distillation" | "Risk Mitigation";
  description: string;
  annualSavings: number;
  confidenceScore: number; // 0-100
  status: RecommendationStatus;
  reasoning: string[];
  dataSources: string[];
  assumptions: string[];
  risks: string[];
  recommendedAction: string;
  createdAt: string;
  version: string;
  explainability?: ExplainabilityDetails;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  type: "Current" | "Optimistic" | "Expected" | "Conservative";
  plannedBudget: number;
  timelineMonths: number;
  expectedRoi: number;
  riskScore: number;
  paybackPeriodMonths: number;
  highlights: string[];
}

export interface ExecutiveScorecardMetrics {
  portfolioAiScore: number; // 0-100
  averageConfidence: number; // 0-100
  portfolioRiskLevel: "Low" | "Medium" | "High";
  estimatedAnnualSavings: number;
  averageRoi: number;
  averagePaybackMonths: number;
  awaitingDecisionCount: number;
}

export interface AiAnalysisResult {
  initiativeId: string;
  recommendations: AiRecommendation[];
  financials: FinancialForecast;
  risks: RiskScores;
  scorecard: ExecutiveScorecardMetrics;
  strategicAlignmentScore: number; // 0-100
  priorityScore: number; // 0-100
  timestamp: string;
  engineProvider: string;
}

export interface IAIEngineProvider {
  providerName: string;
  analyzeInitiative(initiativeData: any): Promise<AiAnalysisResult>;
  getRecommendations(): Promise<AiRecommendation[]>;
  evaluateScenario(scenarioData: Partial<WhatIfScenario>): Promise<WhatIfScenario>;
}
