"use client";

import React, { useState, useMemo } from "react";
import { Activity, Sparkles, DollarSign, ShieldCheck, Layers, Filter } from "lucide-react";
import { UnifiedTimelineEvent } from "../../types/integration";

export interface GlobalActivityCenterProps {
  events: UnifiedTimelineEvent[];
}

export function GlobalActivityCenter({ events }: GlobalActivityCenterProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const filteredEvents = useMemo(() => {
    if (filterCategory === "ALL") return events;
    return events.filter((e) => e.category === filterCategory);
  }, [events, filterCategory]);

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Global Enterprise Activity Stream</h3>
        </div>

        <div className="flex gap-1 text-[10px]">
          {["ALL", "AI", "Financial", "Workflow", "User"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded border font-semibold transition-colors ${
                filterCategory === cat
                  ? "bg-accent/15 text-accent border-accent/30 font-bold"
                  : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">{evt.title}</span>
              <span className="text-[10px] text-muted-foreground">Actor: {evt.actor} • {evt.category}</span>
            </div>

            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
              {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
