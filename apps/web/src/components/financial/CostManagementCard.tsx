"use client";

import React from "react";
import { Wallet, Server, Shield, Users, HelpCircle, HardDrive } from "lucide-react";
import { calculateCostVariance } from "../../lib/financial/calculator";

export function CostManagementCard() {
  const costBreakdown = [
    { category: "Cloud Compute (GPU Clusters)", planned: 950000, actual: 880000, type: "OPEX" },
    { category: "LLM API Licensing", planned: 600000, actual: 580000, type: "OPEX" },
    { category: "Internal Engineering Labor", planned: 700000, actual: 590000, type: "CAPEX" },
    { category: "External MLOps Consulting", planned: 450000, actual: 210000, type: "CAPEX" },
    { category: "Support & Maintenance", planned: 200000, actual: 70000, type: "OPEX" },
  ];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">CAPEX vs. OPEX Cost Management</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          -19.6% Under Budget
        </span>
      </div>

      <div className="space-y-3">
        {costBreakdown.map((item, idx) => {
          const calc = calculateCostVariance(item.actual, item.planned);
          return (
            <div key={idx} className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-secondary border border-border">
                    {item.type}
                  </span>
                  <span className="font-semibold text-foreground">{item.category}</span>
                </div>

                <span className="font-mono font-bold text-foreground">
                  ${(item.actual / 1000).toFixed(0)}k <span className="text-muted-foreground font-normal">/ ${(item.planned / 1000).toFixed(0)}k</span>
                </span>
              </div>

              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${calc.isOverBudget ? "bg-rose-500" : "bg-emerald-500"} transition-all duration-300`}
                  style={{ width: `${Math.min((item.actual / item.planned) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
