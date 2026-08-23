"use client";

import React from "react";
import { Building2, Calendar, Sparkles, Plus, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button, Badge, Skeleton } from "../ui";
import { cn } from "../ui/cn";

export interface ExecutiveWelcomeProps {
  orgName?: string;
  loading?: boolean;
  error?: string | null;
  onNewInitiative?: () => void;
  onRunAiStudio?: () => void;
}

export function ExecutiveWelcome({
  orgName = "Acme Enterprise Solutions",
  loading = false,
  error = null,
  onNewInitiative,
  onRunAiStudio,
}: ExecutiveWelcomeProps) {
  if (loading) {
    return (
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-card shadow-2xs space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider">Welcome Banner Error</div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-6 sm:p-8 shadow-sm transition-all motion-reveal motion-hover-lift">
      {/* Subtle ambient accent glow in top right */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          {/* Organization & Fiscal Context Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
              <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              {orgName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Q3 FY2026 Executive Context
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Audit Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Executive Value Intelligence
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Real-time portfolio management, financial return baselines, and AI decision intelligence for enterprise strategic investments.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={onRunAiStudio}
            variant="secondary"
            className="border border-cyan-500/30 hover:border-cyan-500/60 text-xs h-9 px-3.5 cta-button-hover"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            AI Value Studio
          </Button>

          <Button
            onClick={onNewInitiative}
            variant="primary"
            className="text-xs h-9 px-3.5 cta-button-hover"
          >
            <Plus className="w-3.5 h-3.5" />
            New Initiative
          </Button>
        </div>
      </div>
    </div>
  );
}
