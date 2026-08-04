/**
 * Independent Calculation Utilities for AI Financial & Risk Analysis
 */

import { FinancialForecast, RiskScores, WhatIfScenario } from "../../types/ai";

export function calculateFinancialForecast(
  budget: number,
  expectedBenefit: number
): FinancialForecast {
  const safeBudget = Math.max(budget, 1);
  const netValue = expectedBenefit - safeBudget;
  const roi = ((expectedBenefit - safeBudget) / safeBudget) * 100;
  const payback = (safeBudget / (expectedBenefit / 12));
  const breakEven = Math.ceil(payback);

  return {
    plannedInvestment: safeBudget,
    expectedAnnualBenefit: expectedBenefit,
    netValueCreation: netValue,
    roiPercentage: Math.round(roi * 10) / 10,
    paybackMonths: Math.round(payback * 10) / 10,
    breakEvenMonth: breakEven,
    mockNpv: Math.round(netValue * 0.85),
    mockIrr: Math.round(roi * 0.45 * 10) / 10,
  };
}

export function calculateRiskScores(
  budget: number,
  timelineMonths: number,
  businessArea: string
): RiskScores {
  const finRisk = Math.min(Math.round((budget / 1000000) * 25), 85);
  const delRisk = Math.min(Math.round(timelineMonths * 4.5), 90);
  const techRisk = businessArea.includes("Engineering") ? 65 : 35;
  const compRisk = businessArea.includes("Legal") || businessArea.includes("Finance") ? 55 : 20;
  const opRisk = 40;

  const avgScore = (finRisk + delRisk + techRisk + compRisk + opRisk) / 5;
  const overallRiskLevel = avgScore > 60 ? "High" : avgScore > 40 ? "Medium" : "Low";

  return {
    financialRisk: finRisk,
    deliveryRisk: delRisk,
    technologyRisk: techRisk,
    complianceRisk: compRisk,
    operationalRisk: opRisk,
    overallRiskLevel,
  };
}

export function compareScenarios(a: WhatIfScenario, b: WhatIfScenario) {
  return {
    budgetDelta: b.plannedBudget - a.plannedBudget,
    roiDelta: b.expectedRoi - a.expectedRoi,
    riskDelta: b.riskScore - a.riskScore,
    paybackDelta: b.paybackPeriodMonths - a.paybackPeriodMonths,
  };
}
