"use client";

import React, { useState } from "react";
import { Sliders, TrendingUp, DollarSign } from "lucide-react";
import { FinancialForecastScenario } from "../../types/financial";
import { calculateForecastScenarios } from "../../lib/financial/calculator";

export function FinancialForecastsCard() {
  const scenarios = calculateForecastScenarios(2330000, 4940000);
  const [selectedType, setSelectedType] = useState<string>("EXPECTED");

  const activeScen = scenarios.find((s) => s.type === selectedType) || scenarios[1];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
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
              className={`p-3 rounded-lg border text-left transition-all space-y-1 ${
                isActive
                  ? "bg-accent/10 border-accent/40 text-foreground font-bold shadow-2xs"
                  : "bg-secondary/20 border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-accent block">{sc.type}</span>
              <span className="text-xs truncate block font-bold">{sc.name}</span>
              <span className="text-[10px] font-mono text-emerald-500 block">+{sc.roiPercentage}% ROI</span>
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
