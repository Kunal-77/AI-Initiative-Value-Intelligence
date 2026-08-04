"use client";

import React from "react";
import { TrendingUp, DollarSign, PieChart, Calendar, Award } from "lucide-react";
import { FinancialForecast } from "../../types/ai";

export interface FinancialProjectionsProps {
  financials?: FinancialForecast;
}

const DEFAULT_FINANCIALS: FinancialForecast = {
  plannedInvestment: 650000,
  expectedAnnualBenefit: 1400000,
  netValueCreation: 750000,
  roiPercentage: 215,
  paybackMonths: 5.6,
  breakEvenMonth: 6,
  mockNpv: 637500,
  mockIrr: 96.7,
};

export function FinancialProjections({ financials = DEFAULT_FINANCIALS }: FinancialProjectionsProps) {
  const metrics = [
    { label: "Planned Capital Investment", value: `$${financials.plannedInvestment.toLocaleString()}`, icon: DollarSign, accent: "text-foreground" },
    { label: "Expected Annual Benefit", value: `$${financials.expectedAnnualBenefit.toLocaleString()}`, icon: TrendingUp, accent: "text-emerald-500" },
    { label: "Net Value Creation", value: `$${financials.netValueCreation.toLocaleString()}`, icon: Award, accent: "text-accent" },
    { label: "Payback Period", value: `${financials.paybackMonths} months`, icon: Calendar, accent: "text-foreground" },
  ];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">ROI & Financial Projections</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          DCF Forecast Mode
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-semibold uppercase">{m.label}</span>
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className={`text-lg font-extrabold font-mono block ${m.accent}`}>{m.value}</span>
            </div>
          );
        })}
      </div>

      {/* Advanced Valuation Breakdown */}
      <div className="p-4 rounded-lg bg-secondary/20 border border-border/60 grid grid-cols-3 gap-4 text-center text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block">Net Present Value (NPV)</span>
          <span className="font-mono font-extrabold text-foreground">${financials.mockNpv.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Internal Rate of Return (IRR)</span>
          <span className="font-mono font-extrabold text-emerald-500">{financials.mockIrr}%</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Break-even Month</span>
          <span className="font-mono font-extrabold text-accent">Month {financials.breakEvenMonth}</span>
        </div>
      </div>
    </div>
  );
}
