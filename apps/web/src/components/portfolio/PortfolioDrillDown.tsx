"use client";

import React, { useState } from "react";
import { ChevronRight, FolderKanban, Building2, User, DollarSign, Sparkles } from "lucide-react";

export function PortfolioDrillDown() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState("Global Operations");
  const [selectedDept, setSelectedDept] = useState("Operations & Care");
  const [selectedInit, setSelectedInit] = useState("Customer Support Automation");

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Hierarchical Portfolio Drill-Down Explorer</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          Interactive Hierarchy
        </span>
      </div>

      {/* Drill-down Breadcrumb Path */}
      <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto py-1">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`hover:underline flex items-center gap-1 ${activeStep === 1 ? "text-accent font-bold" : "text-muted-foreground"}`}
        >
          <Building2 className="w-3.5 h-3.5" /> Portfolio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`hover:underline ${activeStep === 2 ? "text-accent font-bold" : "text-muted-foreground"}`}
        >
          {selectedUnit}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`hover:underline ${activeStep === 3 ? "text-accent font-bold" : "text-muted-foreground"}`}
        >
          {selectedDept}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-foreground font-bold">{selectedInit}</span>
      </div>

      {/* Hierarchy Step Details */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground text-sm">{selectedInit}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Status: ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-muted-foreground">
          <div>
            <span className="text-[10px] uppercase font-bold block text-foreground">Planned Investment</span>
            <span className="font-mono text-foreground font-bold">$650,000 USD</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold block text-foreground">Value Impact</span>
            <span className="font-mono text-emerald-500 font-bold">+$1,400,000 / yr</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold block text-foreground">Linked AI Signal</span>
            <span className="font-mono text-accent font-bold">GPU Cluster Optimization (94% Conf)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
