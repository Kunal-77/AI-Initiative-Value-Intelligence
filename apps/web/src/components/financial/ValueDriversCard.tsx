"use client";

import React from "react";
import { Layers, ShieldCheck, Zap, Heart, Award, CheckCircle } from "lucide-react";

export function ValueDriversCard() {
  const drivers = [
    { category: "Cost Reduction", impact: "$3.45M", score: 94, color: "bg-emerald-500" },
    { category: "Productivity Uplift", impact: "$850k", score: 88, color: "bg-blue-600" },
    { category: "Operational Efficiency", impact: "$640k", score: 82, color: "bg-accent" },
    { category: "Risk & Compliance", impact: "$420k", score: 91, color: "bg-sky-500" },
    { category: "Customer Satisfaction", impact: "+14 NPS", score: 86, color: "bg-amber-500" },
  ];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Strategic Value Drivers</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          7 Categories Evaluated
        </span>
      </div>

      <div className="space-y-3">
        {drivers.map((d, idx) => (
          <div key={idx} className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-muted-foreground text-[11px]">
              <span className="font-semibold text-foreground">{d.category}</span>
              <span className="font-mono font-bold text-foreground">{d.impact}</span>
            </div>

            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full ${d.color} transition-all duration-300`} style={{ width: `${d.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
