"use client";

import React from "react";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export function RoiTrendChart() {
  const data = [120, 145, 180, 215, 240, 284];
  const months = ["M1", "M2", "M3", "M4", "M5", "M6"];
  const max = 300;
  const height = 80;
  const width = 240;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 20) + 10;
      const y = height - (val / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> ROI Trend Growth (% Return)
        </span>
        <span className="text-[10px] font-mono text-emerald-500 font-bold">+284% Total</span>
      </div>

      <div className="flex justify-center pt-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {data.map((val, idx) => {
            const x = (idx / (data.length - 1)) * (width - 20) + 10;
            const y = height - (val / max) * (height - 20) - 10;
            return <circle key={idx} cx={x} cy={y} r="3" className="fill-emerald-500" />;
          })}
        </svg>
      </div>

      <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
        {months.map((m, idx) => (
          <span key={idx}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function CostVsBenefitChart() {
  const categories = [
    { label: "GPU Compute", cost: 280, benefit: 650 },
    { label: "LLM API", cost: 180, benefit: 420 },
    { label: "Engineering", cost: 140, benefit: 310 },
  ];

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-accent" /> Cost vs. Benefit Breakdown ($k)
        </span>
        <div className="flex items-center gap-2 text-[9px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500 inline-block" /> Cost</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> Benefit</span>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {categories.map((c, idx) => (
          <div key={idx} className="space-y-1 text-[11px]">
            <div className="flex justify-between text-muted-foreground">
              <span className="font-semibold text-foreground">{c.label}</span>
              <span className="font-mono">${c.cost}k vs ${c.benefit}k</span>
            </div>
            <div className="flex h-2 bg-secondary rounded-full overflow-hidden gap-0.5">
              <div className="bg-indigo-500 h-full" style={{ width: `${(c.cost / 800) * 100}%` }} />
              <div className="bg-emerald-500 h-full" style={{ width: `${(c.benefit / 800) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
