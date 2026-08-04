"use client";

import React from "react";
import { Sparkles, ShieldCheck, DollarSign, TrendingUp, Calendar, ShieldAlert, Clock } from "lucide-react";
import { ExecutiveScorecardMetrics } from "../../types/ai";

export interface AiScorecardProps {
  scorecard: ExecutiveScorecardMetrics;
}

export function AiScorecard({ scorecard }: AiScorecardProps) {
  const cards = [
    {
      label: "Portfolio AI Score",
      value: `${scorecard.portfolioAiScore}/100`,
      icon: Sparkles,
      subtext: "Algorithmic alignment index",
      color: "text-accent",
    },
    {
      label: "Average Confidence",
      value: `${scorecard.averageConfidence}%`,
      icon: ShieldCheck,
      subtext: "Cross-model validation score",
      color: "text-emerald-500",
    },
    {
      label: "Portfolio Risk",
      value: scorecard.portfolioRiskLevel,
      icon: ShieldAlert,
      subtext: "5-factor risk composite",
      color: scorecard.portfolioRiskLevel === "High" ? "text-rose-500" : "text-amber-500",
    },
    {
      label: "Est. Annual Savings",
      value: `+$${(scorecard.estimatedAnnualSavings / 1000).toFixed(0)}k/yr`,
      icon: DollarSign,
      subtext: "Identified value uplift",
      color: "text-emerald-500",
    },
    {
      label: "Average ROI",
      value: `${scorecard.averageRoi}%`,
      icon: TrendingUp,
      subtext: "Target baseline return",
      color: "text-accent",
    },
    {
      label: "Average Payback",
      value: `${scorecard.averagePaybackMonths}m`,
      icon: Calendar,
      subtext: "Capital recovery velocity",
      color: "text-foreground",
    },
    {
      label: "Awaiting Decision",
      value: `${scorecard.awaitingDecisionCount} Pending`,
      icon: Clock,
      subtext: "Actionable recommendations",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-1 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>

            <span className={`text-base sm:text-lg font-extrabold font-mono tracking-tight block ${c.color}`}>
              {c.value}
            </span>

            <p className="text-[9px] text-muted-foreground truncate">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
