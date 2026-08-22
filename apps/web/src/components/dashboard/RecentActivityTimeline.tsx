"use client";

import React from "react";
import { Clock, CheckCircle2, DollarSign, Sparkles, FileText } from "lucide-react";
import { Skeleton, ErrorBanner, EmptyState } from "../ui";
import { MOCK_AUDIT_EVENTS, AuditEventMock } from "../../lib/mockData";

export interface RecentActivityTimelineProps {
  events?: AuditEventMock[];
  loading?: boolean;
  error?: string | null;
}

export function RecentActivityTimeline({
  events = MOCK_AUDIT_EVENTS,
  loading = false,
  error = null,
}: RecentActivityTimelineProps) {
  if (loading) {
    return (
      <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load activity log: ${error}`} variant="red" />;
  }

  if (!events || events.length === 0) {
    return <EmptyState title="No Recent Activity" description="Audit events will log here automatically as team members interact." variant="dashed" />;
  }

  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4 hover:border-blue-500/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Recent Audit & Activity Log</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          Live Stream
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
        {events.map((event) => {
          let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
          if (event.type === "cost") badgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
          if (event.type === "ai") badgeColor = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
          if (event.type === "milestone") badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

          return (
            <div key={event.id} className="relative flex items-start gap-3 text-xs group">
              {/* User Avatar Circle on Timeline Connector */}
              <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-[9px] flex items-center justify-center border border-border/60 shadow-xs shadow-blue-500/20 shrink-0">
                {event.userInitials}
              </div>

              <div className="space-y-1 min-w-0 flex-1 bg-secondary/20 p-2.5 rounded-lg border border-border/50 group-hover:border-border transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground text-xs leading-snug">{event.title}</p>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{event.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">{event.user}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.2 rounded border font-semibold text-[9px] uppercase ${badgeColor}`}>
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
