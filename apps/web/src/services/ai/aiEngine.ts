/**
 * Modular AI Engine Service Interface & Deterministic Mock Provider
 * Allows seamless hot-swapping between MockAIEngine, OpenAI, Azure, Claude, and Gemini.
 */

import {
  IAIEngineProvider,
  AiAnalysisResult,
  AiRecommendation,
  WhatIfScenario,
  ExecutiveScorecardMetrics,
} from "../../types/ai";
import { calculateFinancialForecast, calculateRiskScores } from "../../lib/analysis/calculator";

export class MockAIEngine implements IAIEngineProvider {
  providerName = "Value Intel Deterministic AI v2.4 (Mock)";

  private storedRecommendations: AiRecommendation[] = [
    {
      id: "rec_gpu_opt",
      initiativeId: "init_cs_auto",
      initiativeName: "Customer Support Automation",
      businessArea: "Operations & Care",
      title: "Consolidate GPU Inference Clusters",
      category: "Compute Optimization",
      description: "Migrating off-peak LLM workloads to serverless Dataproc batch sessions will reduce compute costs by $140,000 annually without degrading SLA.",
      annualSavings: 140000,
      confidenceScore: 94,
      status: "PENDING",
      reasoning: [
        "Historical telemetry shows GPU cluster utilization drops to 12% between 01:00 UTC and 06:00 UTC.",
        "Serverless batch inference instances cost $0.18/hr vs $2.40/hr for dedicated A100 nodes.",
        "Zero SLA impact on end-user ticket response time."
      ],
      dataSources: [
        "GCP Cloud Monitoring Inference Telemetry",
        "Zendesk Peak Hour Ticket Volume Ledger",
        "NVIDIA Tensor Core Cost Matrix v2026"
      ],
      assumptions: [
        "Inference latency tolerance under 800ms during off-peak hours.",
        "Current LLM model weights remain under 14GB RAM footprint."
      ],
      risks: [
        "Transient cold-start delay of +120ms during sudden traffic spikes."
      ],
      recommendedAction: "Execute terraform batch session auto-scaling migration.",
      createdAt: "2026-08-04T10:30:00Z",
      version: "v2.4",
    },
    {
      id: "rec_base_recal",
      initiativeId: "init_cs_auto",
      initiativeName: "Customer Support Automation",
      businessArea: "Operations & Care",
      title: "Recalibrate Target Baseline for Support Bot",
      category: "Target Realignment",
      description: "Ticket resolution velocity exceeded initial 30% baseline target by +12%. Update metrics target to 42% for accurate value tracking.",
      annualSavings: 95000,
      confidenceScore: 88,
      status: "ACCEPTED",
      reasoning: [
        "Observed post-deployment ticket deflection reached 42.4% across 14,000 sample tickets.",
        "Initial 30% target underestimates ROI contribution by $95,000 annually."
      ],
      dataSources: [
        "Customer Care Audit Report Q2 2026",
        "BigQuery Analytics Metric Store"
      ],
      assumptions: [
        "Ticket complexity distribution remains consistent throughout Q3."
      ],
      risks: [
        "None identified."
      ],
      recommendedAction: "Update baseline metric target in Initiative Management.",
      createdAt: "2026-08-03T16:15:00Z",
      version: "v2.3",
    },
    {
      id: "rec_model_dist",
      initiativeId: "init_dev_pilot",
      initiativeName: "AI Code Assistant Pilot",
      businessArea: "Software Engineering",
      title: "Distill Llama-3 70B to 8B for Autocomplete Triage",
      category: "Model Distillation",
      description: "Fine-tuning an 8B parameters model for inline code suggestions reduces token latency by 68% and cuts monthly licensing spend by $85,000.",
      annualSavings: 85000,
      confidenceScore: 91,
      status: "PENDING",
      reasoning: [
        "Autocomplete prompts require short context window (<512 tokens).",
        "8B quantized models achieve 96.2% Pass@1 accuracy on internal repository benchmarks."
      ],
      dataSources: [
        "Developer Productivity Benchmarks v3",
        "Vertex AI Endpoint Cost Summary"
      ],
      assumptions: [
        "Training dataset refreshed monthly from main branch commits."
      ],
      risks: [
        "Minor accuracy degradation on niche legacy COBOL codebases."
      ],
      recommendedAction: "Deploy distilled 8B model to staging developer pool.",
      createdAt: "2026-08-02T11:45:00Z",
      version: "v2.2",
    },
  ];

  async getRecommendations(): Promise<AiRecommendation[]> {
    return this.storedRecommendations;
  }

  async analyzeInitiative(initiativeData: any): Promise<AiAnalysisResult> {
    const budget = Number(initiativeData.plannedBudget || 650000);
    const expectedBenefit = budget * 2.15;

    const financials = calculateFinancialForecast(budget, expectedBenefit);
    const risks = calculateRiskScores(budget, 6, initiativeData.businessArea || "Operations");

    const totalSavings = this.storedRecommendations.reduce((acc, r) => acc + r.annualSavings, 0);
    const avgConf = Math.round(this.storedRecommendations.reduce((acc, r) => acc + r.confidenceScore, 0) / this.storedRecommendations.length);
    const pendingCount = this.storedRecommendations.filter((r) => r.status === "PENDING").length;

    const scorecard: ExecutiveScorecardMetrics = {
      portfolioAiScore: 92,
      averageConfidence: avgConf,
      portfolioRiskLevel: risks.overallRiskLevel,
      estimatedAnnualSavings: totalSavings,
      averageRoi: financials.roiPercentage,
      averagePaybackMonths: financials.paybackMonths,
      awaitingDecisionCount: pendingCount,
    };

    return {
      initiativeId: initiativeData.id || "init_cs_auto",
      recommendations: this.storedRecommendations,
      financials,
      risks,
      scorecard,
      strategicAlignmentScore: 92,
      priorityScore: 88,
      timestamp: new Date().toISOString(),
      engineProvider: this.providerName,
    };
  }

  async evaluateScenario(scenarioData: Partial<WhatIfScenario>): Promise<WhatIfScenario> {
    const budget = scenarioData.plannedBudget || 500000;
    const timeline = scenarioData.timelineMonths || 6;
    const roi = Math.round(((budget * 2.2 - budget) / budget) * 100);
    const risk = Math.min(Math.round((budget / 1000000) * 30 + timeline * 3), 85);

    return {
      id: scenarioData.id || `scen_${Date.now()}`,
      name: scenarioData.name || "Custom Scenario",
      type: scenarioData.type || "Expected",
      plannedBudget: budget,
      timelineMonths: timeline,
      expectedRoi: roi,
      riskScore: risk,
      paybackPeriodMonths: Math.round((budget / ((budget * 2.2) / 12)) * 10) / 10,
      highlights: [
        `Estimated ROI of ${roi}%`,
        `Risk score evaluated at ${risk}/100`,
        `Payback expected in ${Math.round(budget / ((budget * 2.2) / 12))} months`,
      ],
    };
  }
}

// Global Singleton Export
export const defaultAiEngine: IAIEngineProvider = new MockAIEngine();
