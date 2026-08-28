"use client";

import React from "react";
import Link from "@/compat/link";
import { Clock, Sparkles, DollarSign, ShieldCheck, Layers, User, ArrowUpRight } from "lucide-react";
import { UnifiedTimelineEvent } from "../../types/integration";

export interface UnifiedExecutiveTimelineProps {
  events: UnifiedTimelineEvent[];
}

export function UnifiedExecutiveTimeline({ events }: UnifiedExecutiveTimelineProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Unified Chronological Executive Timeline</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {events.length} Master Events
        </span>
      </div>

      <div className="relative border-l border-border/60 ml-3 pl-4 space-y-4">
        {events.map((evt) => {
          let badgeColor = "bg-secondary text-muted-foreground border-border";
          if (evt.category === "AI") badgeColor = "bg-accent/15 text-accent border-accent/30";
          if (evt.category === "Financial") badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
          if (evt.category === "Workflow") badgeColor = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-card" />

              <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">{evt.title}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${badgeColor}`}>
                    {evt.category}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground">{evt.description}</p>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                  <span>Actor: {evt.actor} • {new Date(evt.timestamp).toLocaleDateString()}</span>
                  {evt.actionHref && (
                    <Link href={evt.actionHref} className="text-accent hover:underline flex items-center font-bold font-sans">
                      Inspect <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
