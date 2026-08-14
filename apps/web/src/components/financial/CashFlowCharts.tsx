"use client";

import React from "react";
import { TrendingUp, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { generateCashFlowTimeline } from "../../lib/financial/calculator";

export function CashFlowCharts({ actualSpend = 2330000, realizedBenefit = 4940000 }: { actualSpend?: number; realizedBenefit?: number }) {
  const timeline = generateCashFlowTimeline(actualSpend, realizedBenefit, 12);
  const breakEvenIndex = timeline.findIndex((t) => t.cumulativeCashFlow >= 0);

  const maxVal = Math.max(...timeline.map((t) => Math.abs(t.cumulativeCashFlow)));
  const height = 100;
  const width = 320;

  const points = timeline
    .map((t, idx) => {
      const x = (idx / (timeline.length - 1)) * (width - 20) + 10;
      const normalized = (t.cumulativeCashFlow / (maxVal * 1.2)) * (height / 2);
      const y = height / 2 - normalized;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Cumulative Cash Flow & Break-even Curve</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          Break-even: Month {breakEvenIndex + 1}
        </span>
      </div>

      {/* SVG Cash Flow Curve */}
      <div className="flex justify-center pt-2 relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Zero Axis Line */}
          <line x1="10" y1={height / 2} x2={width - 10} y2={height / 2} stroke="currentColor" strokeDasharray="3 3" className="text-border" />

          {/* Cumulative Cash Flow Line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Break-even Marker Circle */}
          {breakEvenIndex >= 0 && (
            <circle
              cx={(breakEvenIndex / (timeline.length - 1)) * (width - 20) + 10}
              cy={height / 2 - (timeline[breakEvenIndex].cumulativeCashFlow / (maxVal * 1.2)) * (height / 2)}
              r="5"
              className="fill-accent stroke-background stroke-2"
            />
          )}
        </svg>
      </div>

      <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
        {timeline.map((t, idx) => (
          <span key={idx} className={idx === breakEvenIndex ? "text-accent font-bold" : ""}>
            {t.month}
          </span>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs flex items-center justify-between">
        <span className="text-muted-foreground">Cumulative 12-Month Net Value:</span>
        <span className="font-mono font-extrabold text-emerald-500">
          +${(timeline[timeline.length - 1].cumulativeCashFlow / 1000).toFixed(0)}k
        </span>
      </div>
    </div>
  );
}
