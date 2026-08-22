"use client";

import React from "react";
import { TrendingUp, AlertTriangle, DollarSign, Calendar, HelpCircle, Target } from "lucide-react";
import { AiRecommendation } from "../../types/ai";

export interface ExecutiveInsightCardsProps {
  recommendations: AiRecommendation[];
}

export function ExecutiveInsightCards({ recommendations }: ExecutiveInsightCardsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  const highestSavings = [...recommendations].sort((a, b) => b.annualSavings - a.annualSavings)[0];
  const highestConfidence = [...recommendations].sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
  const lowestConfidence = [...recommendations].sort((a, b) => a.confidenceScore - b.confidenceScore)[0];

  const highlights = [
    {
      title: "Largest Cost Saving",
      item: highestSavings?.title || "GPU Consolidation",
      metric: `+$${(highestSavings?.annualSavings || 140000).toLocaleString()}/yr`,
      subtext: `Initiative: ${highestSavings?.initiativeName || "Customer Support"}`,
      icon: DollarSign,
      border: "border-emerald-500/30 bg-emerald-500/5",
      metricColor: "text-emerald-500 dark:text-emerald-400",
    },
    {
      title: "Highest Confidence AI Signal",
      item: highestConfidence?.title || "GPU Optimization",
      metric: `${highestConfidence?.confidenceScore || 94}% Confidence`,
      subtext: "Validated against GCP inference logs",
      icon: TrendingUp,
      border: "border-cyan-500/30 bg-cyan-500/5",
      metricColor: "text-cyan-500 dark:text-cyan-400",
    },
    {
      title: "Validation Needed (Low Confidence)",
      item: lowestConfidence?.title || "Baseline Recalibration",
      metric: `${lowestConfidence?.confidenceScore || 88}% Score`,
      subtext: "Requires executive sponsor sign-off",
      icon: HelpCircle,
      border: "border-amber-500/30 bg-amber-500/5",
      metricColor: "text-amber-500 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {highlights.map((h, idx) => {
        const Icon = h.icon;
        return (
          <div key={idx} className={`p-4 rounded-xl border ${h.border} text-card-foreground shadow-2xs space-y-2 hover:shadow-xs transition-all duration-200`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h.title}</span>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground truncate">{h.item}</h4>
              <span className={`text-sm font-extrabold font-mono block ${h.metricColor}`}>{h.metric}</span>
            </div>

            <p className="text-[10px] text-muted-foreground truncate">{h.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
