"use client";

import React from "react";
import Link from "@/compat/link";
import { Sparkles, DollarSign, ShieldCheck, ArrowRight, Layers } from "lucide-react";

export function ContextSidebarPanel() {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Active Context Intelligence</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 font-bold">
          Linked
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
          <span className="text-[10px] font-bold uppercase text-accent flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Top AI Recommendation
          </span>
          <p className="font-semibold text-foreground">Consolidate GPU Inference Clusters (94% Conf)</p>
          <Link href="/business/ai-studio" className="text-[10px] text-accent hover:underline flex items-center pt-0.5">
            Inspect Signal <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Financial Realization
          </span>
          <p className="font-semibold text-foreground">$4.94M Realized Benefits (+101.8% Target)</p>
          <Link href="/business/financials" className="text-[10px] text-emerald-500 hover:underline flex items-center pt-0.5">
            View Financial Ledger <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
          <span className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Governance Stage
          </span>
          <p className="font-semibold text-foreground">Executive Review Gate (SLA 2.4 days)</p>
          <Link href="/business/approvals" className="text-[10px] text-indigo-500 hover:underline flex items-center pt-0.5">
            Approval Details <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
