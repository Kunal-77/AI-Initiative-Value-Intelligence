/**
 * Financial Calculation Engine
 * Pure TypeScript financial math utilities (independent of React).
 */

import { CashFlowMonth, BenefitItem, CostItemLedger, FinancialForecastScenario } from "../../types/financial";

export function calculateBenefitVariance(actual: number, target: number) {
  const variance = actual - target;
  const percentage = target > 0 ? (actual / target) * 100 : 0;
  return {
    variance,
    percentage: Math.round(percentage * 10) / 10,
    isPositive: variance >= 0,
  };
}

export function calculateCostVariance(actual: number, planned: number) {
  const variance = actual - planned;
  const percentage = planned > 0 ? (variance / planned) * 100 : 0;
  return {
    variance,
    percentage: Math.round(percentage * 10) / 10,
    isOverBudget: variance > 0,
  };
}

export function calculateBenefitCostRatio(totalBenefits: number, totalCosts: number): number {
  if (totalCosts <= 0) return 0;
  return Math.round((totalBenefits / totalCosts) * 100) / 100;
}

export function generateCashFlowTimeline(
  totalCosts: number,
  annualBenefit: number,
  months: number = 12
): CashFlowMonth[] {
  const monthlyCost = totalCosts / 4; // Spent in first 4 months
  const monthlyBenefit = annualBenefit / 12;

  let cumulative = 0;
  const result: CashFlowMonth[] = [];

  for (let m = 1; m <= months; m++) {
    const investment = m <= 4 ? monthlyCost : 0;
    const benefit = m >= 3 ? monthlyBenefit : 0; // Benefits start month 3
    const net = benefit - investment;
    cumulative += net;

    result.push({
      month: `M${m}`,
      investment: Math.round(investment),
      benefit: Math.round(benefit),
      netCashFlow: Math.round(net),
      cumulativeCashFlow: Math.round(cumulative),
    });
  }

  return result;
}

export function calculateForecastScenarios(
  baseCosts: number,
  baseBenefits: number
): FinancialForecastScenario[] {
  return [
    {
      type: "OPTIMISTIC",
      name: "Optimistic Case (+25% Benefit)",
      roiPercentage: Math.round((((baseBenefits * 1.25) - baseCosts) / baseCosts) * 100),
      npv: Math.round((baseBenefits * 1.25 - baseCosts) * 0.85),
      irrPercentage: 112.5,
      paybackMonths: 3.8,
      totalBenefits: Math.round(baseBenefits * 1.25),
      totalCosts: baseCosts,
      variance: Math.round(baseBenefits * 0.25),
    },
    {
      type: "EXPECTED",
      name: "Expected Baseline Target",
      roiPercentage: Math.round(((baseBenefits - baseCosts) / baseCosts) * 100),
      npv: Math.round((baseBenefits - baseCosts) * 0.85),
      irrPercentage: 85.0,
      paybackMonths: 5.2,
      totalBenefits: baseBenefits,
      totalCosts: baseCosts,
      variance: 0,
    },
    {
      type: "CONSERVATIVE",
      name: "Conservative Case (-15% Benefit)",
      roiPercentage: Math.round((((baseBenefits * 0.85) - baseCosts) / baseCosts) * 100),
      npv: Math.round((baseBenefits * 0.85 - baseCosts) * 0.85),
      irrPercentage: 62.0,
      paybackMonths: 6.8,
      totalBenefits: Math.round(baseBenefits * 0.85),
      totalCosts: baseCosts,
      variance: -Math.round(baseBenefits * 0.15),
    },
    {
      type: "WORST_CASE",
      name: "Worst Case (+20% Cost / -30% Benefit)",
      roiPercentage: Math.round((((baseBenefits * 0.7) - (baseCosts * 1.2)) / (baseCosts * 1.2)) * 100),
      npv: Math.round((baseBenefits * 0.7 - baseCosts * 1.2) * 0.85),
      irrPercentage: 28.0,
      paybackMonths: 9.5,
      totalBenefits: Math.round(baseBenefits * 0.7),
      totalCosts: Math.round(baseCosts * 1.2),
      variance: -Math.round(baseBenefits * 0.3 + baseCosts * 0.2),
    },
  ];
}
