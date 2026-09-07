"use client";

import React from "react";
import { Sparkles, Cpu, Play, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "../ui";

export interface AiStudioHeaderProps {
  engineProvider?: string;
  isAnalyzing?: boolean;
  onRunAnalysis?: () => void;
}

export function AiStudioHeader({
  engineProvider = "Value Intel Deterministic AI v2.4 (Mock)",
  isAnalyzing = false,
  onRunAnalysis,
}: AiStudioHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#202630] bg-gradient-to-br from-[#11151C] via-[#11151C] to-[#171C24] p-6 sm:p-8 shadow-sm transition-all">
      {/* Subtle Glow Backdrop */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#7DA7D9]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7DA7D9]/10 text-[#7DA7D9] text-xs font-semibold border border-[#7DA7D9]/20 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              AI Value Studio
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#171C24] text-[#D9DEE7] text-xs font-mono border border-[#202630]">
              <Cpu className="w-3.5 h-3.5 text-[#C9A86A]" />
              {engineProvider}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Executive Decision Intelligence
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Data-driven ROI forecasting, risk scoring, explainable recommendations, and what-if scenario modeling for strategic AI investments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={onRunAnalysis}
            loading={isAnalyzing}
            loadingText="Analyzing Portfolio..."
            variant="primary"
            className="text-xs h-9 px-4 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Run Portfolio Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
