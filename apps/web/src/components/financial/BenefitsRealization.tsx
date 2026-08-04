"use client";

import React, { useState } from "react";
import { TrendingUp, DollarSign, Calendar, BarChart2 } from "lucide-react";
import { calculateBenefitVariance } from "../../lib/financial/calculator";

export function BenefitsRealization() {
  const [timeframe, setTimeframe] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("QUARTERLY");

  const expected = 4850000;
  const actual = 4940000;
  const calc = calculateBenefitVariance(actual, expected);

  const quarterlyData = [
    { label: "Q1 FY26", expected: 1100, actual: 1150 },
    { label: "Q2 FY26", expected: 1200, actual: 1240 },
    { label: "Q3 FY26 (Current)", expected: 1250, actual: 1280 },
    { label: "Q4 FY26 (Forecast)", expected: 1300, actual: 1270 },
  ];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Benefits Realization & Forecast Trend</h3>
        </div>

        <div className="flex gap-1 text-[10px]">
          {(["MONTHLY", "QUARTERLY", "ANNUAL"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                timeframe === tf
                  ? "bg-accent/15 text-accent border-accent/30 font-bold"
                  : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Expected Benefit</span>
          <span className="text-base font-extrabold font-mono text-foreground">${(expected / 1000000).toFixed(2)}M</span>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">Realized Benefit</span>
          <span className="text-base font-extrabold font-mono text-emerald-500">${(actual / 1000000).toFixed(2)}M</span>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Realization Variance</span>
          <span className="text-base font-extrabold font-mono text-emerald-500">+{calc.percentage}%</span>
        </div>
      </div>

      {/* Quarterly Forecast Trend Bars */}
      <div className="space-y-2.5 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          {timeframe} Realization Velocity ($k)
        </span>
        {quarterlyData.map((q, idx) => (
          <div key={idx} className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground text-[11px]">
              <span className="font-semibold text-foreground">{q.label}</span>
              <span className="font-mono">${q.actual}k / ${q.expected}k target</span>
            </div>
            <div className="flex h-2 bg-secondary rounded-full overflow-hidden gap-0.5">
              <div className="bg-indigo-500 h-full" style={{ width: `${(q.expected / 1500) * 100}%` }} />
              <div className="bg-emerald-500 h-full" style={{ width: `${(q.actual / 1500) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
