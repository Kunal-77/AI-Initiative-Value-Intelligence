/**
 * Strongly Typed Interfaces for Financial Intelligence & Benefits Tracking
 * Maps 1:1 with future FastAPI financial endpoints.
 */

export type CostCategory =
  | "CAPEX"
  | "OPEX"
  | "CLOUD_COMPUTE"
  | "INFRASTRUCTURE"
  | "LICENSING"
  | "VENDOR_COSTS"
  | "INTERNAL_LABOR"
  | "EXTERNAL_CONSULTING"
  | "SUPPORT_MAINTENANCE";

export type ValueDriverCategory =
  | "REVENUE_GROWTH"
  | "COST_REDUCTION"
  | "RISK_REDUCTION"
  | "PRODUCTIVITY"
  | "CUSTOMER_SATISFACTION"
  | "COMPLIANCE"
  | "OPERATIONAL_EFFICIENCY";

export type ForecastScenarioType = "OPTIMISTIC" | "EXPECTED" | "CONSERVATIVE" | "WORST_CASE";

export interface BenefitItem {
  id: string;
  initiativeId: string;
  initiativeName: string;
  benefitName: string;
  owner: string;
  category: ValueDriverCategory;
  targetAmount: number;
  actualAmount: number;
  varianceAmount: number;
  status: "ON_TRACK" | "AT_RISK" | "ACHIEVED" | "DELAYED";
  evidenceSource: string;
}

export interface CostItemLedger {
  id: string;
  initiativeId: string;
  initiativeName: string;
  expenseName: string;
  vendor: string;
  department: string;
  category: CostCategory;
  plannedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  date: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  approvalOwner: string;
}

export interface CashFlowMonth {
  month: string; // e.g. "M1"
  investment: number;
  benefit: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

export interface FinancialForecastScenario {
  type: ForecastScenarioType;
  name: string;
  roiPercentage: number;
  npv: number;
  irrPercentage: number;
  paybackMonths: number;
  totalBenefits: number;
  totalCosts: number;
  variance: number;
}

export interface ExecutiveFinancialMetrics {
  totalPlannedInvestment: number;
  totalActualSpend: number;
  totalExpectedBenefit: number;
  totalRealizedBenefit: number;
  overallPortfolioRoi: number;
  budgetVariancePercentage: number;
  benefitRealizationPercentage: number;
  topCostDriver: string;
  largestSavingInitiative: string;
}
