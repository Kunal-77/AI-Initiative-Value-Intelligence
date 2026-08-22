"use client";

import React, { useState } from "react";
import { Sliders, TrendingUp, DollarSign } from "lucide-react";
import { FinancialForecastScenario } from "../../types/financial";
import { calculateForecastScenarios } from "../../lib/financial/calculator";

export function FinancialForecastsCard({ actualSpend = 2330000, realizedBenefit = 4940000 }: { actualSpend?: number; realizedBenefit?: number }) {
  const scenarios = calculateForecastScenarios(actualSpend, realizedBenefit);
  const [selectedType, setSelectedType] = useState<string>("EXPECTED");

  const activeScen = scenarios.find((s) => s.type === selectedType) || scenarios[1];

  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">4-Scenario Financial Valuation Forecast</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          DCF Valuation Engine
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {scenarios.map((sc) => {
          const isActive = sc.type === selectedType;
          return (
            <button
              key={sc.type}
              type="button"
              onClick={() => setSelectedType(sc.type)}
              className={`p-3 rounded-xl border text-left transition-all space-y-1 cursor-pointer ${
                isActive
                  ? "bg-blue-500/10 border-blue-500/40 text-foreground font-bold shadow-2xs"
                  : "bg-secondary/20 border-border/80 text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 block">{sc.type}</span>
              <span className="text-xs truncate block font-bold">{sc.name}</span>
              <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 block">+{sc.roiPercentage}% ROI</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-secondary/30 border border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Expected Benefits</span>
          <span className="font-mono font-extrabold text-emerald-500">${(activeScen.totalBenefits / 1000000).toFixed(2)}M</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Total Capital Spend</span>
          <span className="font-mono font-extrabold text-foreground">${(activeScen.totalCosts / 1000000).toFixed(2)}M</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Net Present Value</span>
          <span className="font-mono font-extrabold text-accent">${(activeScen.npv / 1000000).toFixed(2)}M</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase">Payback Period</span>
          <span className="font-mono font-extrabold text-foreground">{activeScen.paybackMonths} months</span>
        </div>
      </div>
    </div>
  );
}
