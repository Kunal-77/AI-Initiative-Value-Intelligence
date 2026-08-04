"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RiskScores } from "../../types/ai";

export interface PortfolioRiskOverviewProps {
  risks?: RiskScores;
}

const DEFAULT_RISKS: RiskScores = {
  financialRisk: 35,
  deliveryRisk: 42,
  technologyRisk: 58,
  complianceRisk: 25,
  operationalRisk: 30,
  overallRiskLevel: "Medium",
};

export function PortfolioRiskOverview({ risks = DEFAULT_RISKS }: PortfolioRiskOverviewProps) {
  const riskCategories = [
    { label: "Financial Risk", score: risks.financialRisk, desc: "Budget variance & capital allocation" },
    { label: "Delivery Risk", score: risks.deliveryRisk, desc: "Milestone schedule & velocity" },
    { label: "Technology Risk", score: risks.technologyRisk, desc: "GPU model latency & throughput" },
    { label: "Compliance Risk", score: risks.complianceRisk, desc: "SOC2 PII data governance" },
    { label: "Operational Risk", score: risks.operationalRisk, desc: "Team workflow adoption" },
  ];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Portfolio Risk Engine</h3>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
            risks.overallRiskLevel === "High"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              : risks.overallRiskLevel === "Medium"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          }`}
        >
          {risks.overallRiskLevel} Risk
        </span>
      </div>

      <div className="space-y-3">
        {riskCategories.map((cat, idx) => {
          let barColor = "bg-emerald-500";
          if (cat.score > 40) barColor = "bg-amber-500";
          if (cat.score > 65) barColor = "bg-rose-500";

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">{cat.label}</span>
                <span className="font-mono font-bold text-muted-foreground">{cat.score}/100</span>
              </div>

              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-300 ease-in-out`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{cat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
