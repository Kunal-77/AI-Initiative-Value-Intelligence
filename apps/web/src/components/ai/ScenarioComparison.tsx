"use client";

import React, { useState } from "react";
import { Sliders, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { WhatIfScenario } from "../../types/ai";
import { compareScenarios } from "../../lib/analysis/calculator";
import { Input, Label } from "../ui";

export function ScenarioComparison() {
  const [activeScenario, setActiveScenario] = useState<"Current" | "Optimistic" | "Expected" | "Conservative">("Expected");

  const scenarios: Record<string, WhatIfScenario> = {
    Current: {
      id: "scen_curr",
      name: "Current Operations",
      type: "Current",
      plannedBudget: 650000,
      timelineMonths: 6,
      expectedRoi: 215,
      riskScore: 42,
      paybackPeriodMonths: 5.6,
      highlights: ["Baseline execution speed", "Standard cloud compute instances"],
    },
    Optimistic: {
      id: "scen_opt",
      name: "Optimistic Acceleration",
      type: "Optimistic",
      plannedBudget: 950000,
      timelineMonths: 3,
      expectedRoi: 310,
      riskScore: 68,
      paybackPeriodMonths: 3.7,
      highlights: ["Parallel engineering squads", "Maximal serverless spot scaling"],
    },
    Expected: {
      id: "scen_exp",
      name: "Expected Balanced Target",
      type: "Expected",
      plannedBudget: 750000,
      timelineMonths: 5,
      expectedRoi: 260,
      riskScore: 35,
      paybackPeriodMonths: 4.8,
      highlights: ["Optimal cost-to-benefit ratio", "GCP batch inference optimization"],
    },
    Conservative: {
      id: "scen_cons",
      name: "Conservative Defensive",
      type: "Conservative",
      plannedBudget: 450000,
      timelineMonths: 8,
      expectedRoi: 165,
      riskScore: 22,
      paybackPeriodMonths: 7.2,
      highlights: ["Minimal upfront capital", "Phase-gated deployment"],
    },
  };

  const selectedScen = scenarios[activeScenario];
  const currentScen = scenarios["Current"];
  const diff = compareScenarios(currentScen, selectedScen);

  return (
    <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">4-Scenario Executive What-If Modeling</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          Side-by-Side Comparison
        </span>
      </div>

      {/* 4 Scenario Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.keys(scenarios).map((key) => {
          const sc = scenarios[key];
          const isActive = key === activeScenario;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveScenario(key as any)}
              className={`p-3 rounded-lg border text-left transition-all space-y-1 ${
                isActive
                  ? "bg-accent/10 border-accent/40 text-foreground font-bold shadow-2xs"
                  : "bg-secondary/20 border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-accent block">{sc.type}</span>
              <span className="text-xs truncate block font-bold">{sc.name}</span>
              <span className="text-[10px] font-mono text-emerald-500 block">+{sc.expectedRoi}% ROI</span>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario vs Current Side-by-Side Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-foreground border-b border-border pb-2">
            <span>{currentScen.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground">Baseline Reference</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Budget</span>
              <span className="font-mono font-bold">${(currentScen.plannedBudget / 1000).toFixed(0)}k</span>
            </div>
            <div className="p-2 rounded bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">ROI</span>
              <span className="font-mono font-bold text-emerald-500">{currentScen.expectedRoi}%</span>
            </div>
            <div className="p-2 rounded bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Risk Score</span>
              <span className="font-mono font-bold text-foreground">{currentScen.riskScore}/100</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-accent/5 border border-accent/30 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-foreground border-b border-accent/20 pb-2">
            <span>{selectedScen.name}</span>
            <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 rounded bg-accent/15">Active Selection</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Budget</span>
              <span className="font-mono font-bold">${(selectedScen.plannedBudget / 1000).toFixed(0)}k</span>
            </div>
            <div className="p-2 rounded bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">ROI</span>
              <span className="font-mono font-bold text-emerald-500">{selectedScen.expectedRoi}%</span>
            </div>
            <div className="p-2 rounded bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Risk Score</span>
              <span className="font-mono font-bold text-foreground">{selectedScen.riskScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Difference Banner */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border flex items-center justify-between gap-4 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-foreground">{selectedScen.type} Scenario Variance</span>
          <p className="text-[11px] text-muted-foreground">
            Compared to baseline, {selectedScen.name} yields <span className="font-bold text-emerald-500">{diff.roiDelta >= 0 ? `+${diff.roiDelta}%` : `${diff.roiDelta}%`} ROI variance</span> with a capital delta of <span className="font-mono font-semibold text-foreground">${diff.budgetDelta.toLocaleString()}</span>.
          </p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded border shrink-0 ${diff.roiDelta >= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
          {diff.roiDelta >= 0 ? `+${diff.roiDelta}% Uplift` : `${diff.roiDelta}% ROI`}
        </span>
      </div>
    </div>
  );
}
