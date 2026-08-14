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

import { API_BASE as BASE_URL } from "../../lib/apiConfig";

const API_BASE = `${BASE_URL}/api/v1`;

export async function getExecutiveFinancialMetrics(token: string): Promise<ExecutiveFinancialMetrics> {
  const res = await fetch(`${API_BASE}/financials/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch executive financials summary");
  return res.json();
}

export async function getBenefitsRegister(token: string): Promise<BenefitItem[]> {
  const res = await fetch(`${API_BASE}/financials/benefits`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch benefits register");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    initiativeId: item.initiative_id,
    initiativeName: item.initiative_name,
    benefitName: item.benefit_name,
    owner: item.owner || "N/A",
    category: item.category,
    targetAmount: item.target_amount,
    actualAmount: item.actual_amount,
    varianceAmount: item.variance_amount,
    status: item.status,
    evidenceSource: item.evidence_source || "N/A",
  }));
}

export async function getCostsLedger(token: string): Promise<CostItemLedger[]> {
  const res = await fetch(`${API_BASE}/financials/costs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch costs ledger");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    initiativeId: item.initiative_id,
    initiativeName: item.initiative_name,
    expenseName: item.expense_name,
    vendor: item.vendor,
    department: item.department,
    category: item.category,
    plannedAmount: item.planned_amount,
    actualAmount: item.actual_amount,
    varianceAmount: item.variance_amount,
    date: item.date,
    status: item.status,
    approvalOwner: item.approval_owner,
  }));
}

export async function getCashFlowData(token: string): Promise<CashFlowMonth[]> {
  const metrics = await getExecutiveFinancialMetrics(token);
  return generateCashFlowTimeline(metrics.totalActualSpend, metrics.totalRealizedBenefit, 12);
}

export async function getFinancialScenarios(token: string): Promise<FinancialForecastScenario[]> {
  const metrics = await getExecutiveFinancialMetrics(token);
  return calculateForecastScenarios(metrics.totalActualSpend, metrics.totalRealizedBenefit);
}
