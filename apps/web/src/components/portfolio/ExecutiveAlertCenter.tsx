"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { PortfolioAlert } from "../../types/portfolio";

export interface ExecutiveAlertCenterProps {
  alerts: PortfolioAlert[];
}

export function ExecutiveAlertCenter({ alerts }: ExecutiveAlertCenterProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-foreground">Executive Alert & Notification Stream</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
          {alerts.length} Action Items
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => {
          let badgeColor = "bg-rose-500/10 text-rose-600 border-rose-500/20";
          if (alt.severity === "MEDIUM") badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
          if (alt.severity === "LOW") badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

          return (
            <div key={alt.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-1.5 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-foreground leading-snug">{alt.title}</span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                  {alt.severity} Priority
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Initiative: <strong className="text-foreground">{alt.initiativeName}</strong> • {alt.timestamp}
              </p>

              <p className="text-[11px] text-accent font-semibold flex items-center gap-1 pt-0.5">
                <ArrowRight className="w-3 h-3 shrink-0" />
                {alt.actionRequired}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
