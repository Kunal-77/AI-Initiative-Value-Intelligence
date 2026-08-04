/**
 * Financial Service Layer
 * Interacts with FastAPI financial endpoints or local canonical dataset.
 */

import {
  BenefitItem,
  CostItemLedger,
  ExecutiveFinancialMetrics,
  FinancialForecastScenario,
  CashFlowMonth,
} from "../../types/financial";
import { generateCashFlowTimeline, calculateForecastScenarios } from "../../lib/financial/calculator";

export const MOCK_BENEFITS_REGISTER: BenefitItem[] = [
  {
    id: "ben_1",
    initiativeId: "init_cs_auto",
    initiativeName: "Customer Support Automation",
    benefitName: "Tier-1 Ticket Deflection Savings",
    owner: "Sarah Jenkins (CFO)",
    category: "COST_REDUCTION",
    targetAmount: 1400000,
    actualAmount: 1480000,
    varianceAmount: 80000,
    status: "ACHIEVED",
    evidenceSource: "Zendesk Deflection Audit Ledger Q2",
  },
  {
    id: "ben_2",
    initiativeId: "init_dev_pilot",
    initiativeName: "AI Code Assistant Pilot",
    benefitName: "Developer Productivity Velocity",
    owner: "Alex Rivera (VP Eng)",
    category: "PRODUCTIVITY",
    targetAmount: 850000,
    actualAmount: 820000,
    varianceAmount: -30000,
    status: "ON_TRACK",
    evidenceSource: "GitHub Enterprise PR Velocity Telemetry",
  },
  {
    id: "ben_3",
    initiativeId: "init_doc_proc",
    initiativeName: "Automated Document Processing",
    benefitName: "Legal Contract Audit Reduction",
    owner: "Elena Rostova (General Counsel)",
    category: "OPERATIONAL_EFFICIENCY",
    targetAmount: 620000,
    actualAmount: 590000,
    varianceAmount: -30000,
    status: "ON_TRACK",
    evidenceSource: "Legal Ops Audit Clocking System",
  },
  {
    id: "ben_4",
    initiativeId: "init_supply_chain",
    initiativeName: "Predictive Supply Chain Demand",
    benefitName: "Safety Stock Inventory Holding Optimization",
    owner: "James Thornton (COO)",
    category: "COST_REDUCTION",
    targetAmount: 1980000,
    actualAmount: 2050000,
    varianceAmount: 70000,
    status: "ACHIEVED",
    evidenceSource: "ERP Inventory Carrying Cost Report",
  },
];

export const MOCK_COSTS_LEDGER: CostItemLedger[] = [
  {
    id: "cost_1",
    initiativeId: "init_cs_auto",
    initiativeName: "Customer Support Automation",
    expenseName: "NVIDIA A100 GPU Cloud Compute Cluster",
    vendor: "Google Cloud Platform",
    department: "Operations",
    category: "CLOUD_COMPUTE",
    plannedAmount: 280000,
    actualAmount: 265000,
    varianceAmount: -15000,
    date: "2026-07-15",
    status: "APPROVED",
    approvalOwner: "Sarah Jenkins (CFO)",
  },
  {
    id: "cost_2",
    initiativeId: "init_dev_pilot",
    initiativeName: "AI Code Assistant Pilot",
    expenseName: "GitHub Copilot Enterprise Licenses",
    vendor: "GitHub Inc",
    department: "Software Engineering",
    category: "LICENSING",
    plannedAmount: 120000,
    actualAmount: 120000,
    varianceAmount: 0,
    date: "2026-06-01",
    status: "APPROVED",
    approvalOwner: "Alex Rivera (VP Eng)",
  },
  {
    id: "cost_3",
    initiativeId: "init_doc_proc",
    initiativeName: "Automated Document Processing",
    expenseName: "MLOps Pipeline Integration Consulting",
    vendor: "Slalom Consulting",
    department: "Legal & Compliance",
    category: "EXTERNAL_CONSULTING",
    plannedAmount: 95000,
    actualAmount: 105000,
    varianceAmount: 10000,
    date: "2026-07-20",
    status: "PENDING",
    approvalOwner: "Elena Rostova",
  },
];

export async function getExecutiveFinancialMetrics(): Promise<ExecutiveFinancialMetrics> {
  const totalPlanned = 2900000;
  const totalActual = 2330000;
  const totalExpected = 4850000;
  const totalRealized = 4940000;

  return {
    totalPlannedInvestment: totalPlanned,
    totalActualSpend: totalActual,
    totalExpectedBenefit: totalExpected,
    totalRealizedBenefit: totalRealized,
    overallPortfolioRoi: 212,
    budgetVariancePercentage: -19.6,
    benefitRealizationPercentage: 101.8,
    topCostDriver: "GPU Cloud Inference Clusters ($265,000)",
    largestSavingInitiative: "Predictive Supply Chain Demand ($2,050,000)",
  };
}

export async function getBenefitsRegister(): Promise<BenefitItem[]> {
  return MOCK_BENEFITS_REGISTER;
}

export async function getCostsLedger(): Promise<CostItemLedger[]> {
  return MOCK_COSTS_LEDGER;
}

export async function getCashFlowData(): Promise<CashFlowMonth[]> {
  return generateCashFlowTimeline(2330000, 4940000, 12);
}

export async function getFinancialScenarios(): Promise<FinancialForecastScenario[]> {
  return calculateForecastScenarios(2330000, 4940000);
}
