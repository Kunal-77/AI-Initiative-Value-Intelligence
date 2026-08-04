"use client";

import React from "react";
import { Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { PredictiveInsight } from "../../types/portfolio";

export interface PredictiveAnalyticsCardProps {
  insights: PredictiveInsight[];
}

export function PredictiveAnalyticsCard({ insights }: PredictiveAnalyticsCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Predictive Portfolio Risk Forecasting</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
          Algorithmic Predictions
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((item) => (
          <div key={item.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1.5 text-xs">
            <div className="flex justify-between items-start gap-2">
              <span className="font-bold text-foreground leading-snug">{item.title}</span>
              <span className="text-[10px] font-mono font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 shrink-0">
                {item.confidenceScore}% Conf
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">{item.impactDescription}</p>

            <div className="pt-1.5 border-t border-border/40 text-[11px] text-accent font-semibold flex items-center gap-1">
              <ArrowRight className="w-3 h-3 shrink-0" /> Recommended: {item.recommendedMitigation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
