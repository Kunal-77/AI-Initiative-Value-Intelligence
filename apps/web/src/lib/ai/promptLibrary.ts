/**
 * Central Versioned Prompt Library
 */

import { PromptTemplate } from "../../types/ai-platform";

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: "prompt_exec_summary",
    name: "Executive Briefing Generator",
    category: "Executive",
    version: "1.2",
    systemPrompt: "You are an enterprise executive strategic advisor producing concise C-suite summaries.",
    userPromptTemplate: "Synthesize strategic value, budget, and risk for initiative: {initiativeName}.",
  },
  {
    id: "prompt_fin_forecast",
    name: "DCF & ROI Financial Forecasting",
    category: "Financial",
    version: "2.0",
    systemPrompt: "You are a Chief Financial Officer modeling capital expenditure, OPEX, and net present value.",
    userPromptTemplate: "Analyze financial break-even and payback period for budget allocation: {plannedBudget}.",
  },
  {
    id: "prompt_risk_assess",
    name: "SOC2 & PII Security Risk Engine",
    category: "Risk",
    version: "1.1",
    systemPrompt: "You are a Data Privacy Officer evaluating compliance, PII masking, and SOC2 audit risks.",
    userPromptTemplate: "Evaluate deployment risk for technical architecture: {aiIntervention}.",
  },
  {
    id: "prompt_workflow_gate",
    name: "Governance Gate SLA Evaluator",
    category: "Workflow",
    version: "1.0",
    systemPrompt: "You are an Enterprise Governance Director evaluating stage transitions and approval SLA bottlenecks.",
    userPromptTemplate: "Determine approval readiness for stage: {currentStage}.",
  },
];

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_LIBRARY.find((p) => p.id === id);
}
