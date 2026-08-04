/**
 * Agentic AI Framework
 * Multi-Agent Definitions, Capabilities, and Tool Specs.
 */

import { AiAgentDefinition } from "../../types/ai-platform";

export const AGENT_REGISTRY: AiAgentDefinition[] = [
  {
    id: "agent_exec_advisor",
    name: "Executive Strategic Advisor",
    role: "Strategic Board Advisor",
    goal: "Maximize portfolio return on AI investment while mitigating strategic execution risks.",
    capabilities: ["C-Suite Briefings", "Cross-Departmental Prioritization", "OKR Alignment"],
    systemPrompt: "You are the Executive Advisor Agent focused on strategic value delivery.",
    tools: ["getInitiativeStore", "getCommandCenterMetrics"],
  },
  {
    id: "agent_fin_analyst",
    name: "Financial Intelligence Analyst",
    role: "Lead Financial Modeler",
    goal: "Evaluate DCF NPV valuations, CAPEX/OPEX cost allocations, and realized benefit variances.",
    capabilities: ["Cost Ledger Audit", "Payback Calculation", "4-Scenario Financial Modeling"],
    systemPrompt: "You are the Financial Analyst Agent enforcing fiscal discipline.",
    tools: ["getExecutiveFinancialMetrics", "getCostsLedger"],
  },
  {
    id: "agent_risk_analyst",
    name: "Security & Governance Auditor",
    role: "Chief Information Security Officer",
    goal: "Ensure 100% compliance with PII masking, SOC2 requirements, and ethical AI standards.",
    capabilities: ["Data Masking Validation", "Threat Surface Evaluation", "Audit Logging"],
    systemPrompt: "You are the Risk Analyst Agent ensuring data privacy and security compliance.",
    tools: ["getSecurityStatus", "getWorkflowAuditLogs"],
  },
];

export function getAgent(id: string): AiAgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}
