"use client";

import React from "react";
import { BarChart3, TrendingUp, PieChart, ShieldAlert, Layers } from "lucide-react";

export function PortfolioVisualizations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Line Chart: Portfolio Value Trend */}
      <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4 motion-reveal motion-hover-lift delay-100">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Portfolio Value Realization Trend</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400">+215% Overall ROI</span>
        </div>

        <div className="space-y-3">
          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2 border-b border-border/40">
            {[
              { label: "Jan", val: 35 },
              { label: "Feb", val: 48 },
              { label: "Mar", val: 62 },
              { label: "Apr", val: 78 },
              { label: "May", val: 95 },
              { label: "Jun", val: 120 },
            ].map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all motion-draw-vertical"
                  style={{ height: `${m.val}%` }}
                />
                <span className="text-[9px] font-mono text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Donut Chart: Investment Allocation by Business Area */}
      <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4 motion-reveal motion-hover-lift delay-200">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Capital Allocation by Business Area</h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">$2.9M Total</span>
        </div>

        <div className="space-y-3">
          {[
            { area: "Operations & Care", percentage: 38, amount: "$1,100,000", color: "bg-blue-600" },
            { area: "Software Engineering", percentage: 31, amount: "$900,000", color: "bg-blue-500" },
            { area: "Legal & Compliance", percentage: 17, amount: "$500,000", color: "bg-sky-500" },
            { area: "Finance & Risk", percentage: 14, amount: "$400,000", color: "bg-amber-500" },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span className="font-semibold text-foreground">{item.area}</span>
                <span className="font-mono">{item.amount} ({item.percentage}%)</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${item.color} motion-draw`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Heatmap / Risk Matrix Grid */}
      <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4 md:col-span-2 motion-reveal motion-hover-lift delay-300">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Portfolio Executive Risk Matrix</h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Impact vs Probability</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 motion-hover-lift">
            <span className="font-bold text-emerald-500 dark:text-emerald-400 block">Low Risk / High Impact</span>
            <span className="text-xl font-extrabold font-mono text-foreground block motion-number-reveal">5 Initiatives</span>
            <p className="text-[10px] text-muted-foreground">Customer Support, Code Pilot</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 motion-hover-lift">
            <span className="font-bold text-amber-500 dark:text-amber-400 block">Medium Risk / High Impact</span>
            <span className="text-xl font-extrabold font-mono text-foreground block motion-number-reveal">3 Initiatives</span>
            <p className="text-[10px] text-muted-foreground">Legal Contract Processing</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 motion-hover-lift">
            <span className="font-bold text-rose-500 dark:text-rose-400 block">High Risk / High Impact</span>
            <span className="text-xl font-extrabold font-mono text-foreground block motion-number-reveal">1 Initiative</span>
            <p className="text-[10px] text-muted-foreground">Predictive Supply Chain Demand</p>
          </div>
        </div>
      </div>
    </div>
  );
}
