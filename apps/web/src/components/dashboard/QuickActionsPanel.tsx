"use client";

import React from "react";
import { Zap, Plus, DollarSign, Sparkles, Download, Layers } from "lucide-react";
import { Skeleton, ErrorBanner } from "../ui";

export interface QuickActionsPanelProps {
  loading?: boolean;
  error?: string | null;
  onNewInitiative?: () => void;
  onRunAiStudio?: () => void;
}

export function QuickActionsPanel({
  loading = false,
  error = null,
  onNewInitiative,
  onRunAiStudio,
}: QuickActionsPanelProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load quick actions: ${error}`} variant="red" />;
  }

  const actions = [
    {
      title: "Register New Initiative",
      desc: "Define value baseline & scope",
      icon: Plus,
      onClick: onNewInitiative,
      accent: "text-accent",
    },
    {
      title: "Run AI Decision Studio",
      desc: "Analyze ROI & cost variance",
      icon: Sparkles,
      onClick: onRunAiStudio,
      accent: "text-blue-400",
    },
    {
      title: "Export Executive Briefing",
      desc: "Download PDF/CSV ledger",
      icon: Download,
      onClick: () => alert("Exporting Executive Value Briefing..."),
      accent: "text-emerald-500",
    },
  ];

  return (
    <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-foreground">Executive Quick Actions</h3>
      </div>

      <div className="space-y-2.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={act.onClick}
              className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary border border-border flex items-center justify-between transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-card border border-border group-hover:border-accent/40 ${act.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{act.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
