"use client";

import React from "react";
import { Award, TrendingUp, Building2, CheckCircle2 } from "lucide-react";
import { DepartmentBenchmark } from "../../types/portfolio";

export interface BenchmarkingCardProps {
  benchmarks: DepartmentBenchmark[];
}

export function BenchmarkingCard({ benchmarks }: BenchmarkingCardProps) {
  const best = benchmarks.find((b) => b.isBestPerformer) || benchmarks[0];

  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Cross-Departmental Benchmarking</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Q3 Leader: {best?.department}
        </span>
      </div>

      <div className="space-y-3">
        {benchmarks.map((bm, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 space-y-2 text-xs hover:border-border transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{bm.department}</span>
                {bm.isBestPerformer && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Best Performer
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-emerald-500 dark:text-emerald-400">+{bm.realizedRoi}% ROI</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <div>
                <span>Active Initiatives:</span>
                <span className="font-mono font-bold text-foreground block">{bm.initiativeCount} Projects</span>
              </div>
              <div>
                <span>Capital Spend:</span>
                <span className="font-mono font-bold text-foreground block">${(bm.actualSpend / 1000).toFixed(0)}k</span>
              </div>
              <div>
                <span>AI Adoption:</span>
                <span className="font-mono font-bold text-cyan-500 dark:text-cyan-400 block">{bm.aiAdoptionPercentage}% Rate</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
