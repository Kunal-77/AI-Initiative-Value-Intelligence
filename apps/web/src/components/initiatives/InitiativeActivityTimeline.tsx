"use client";

import React from "react";
import { Clock, CheckCircle2, ShieldCheck, DollarSign, Sparkles, FileText, User } from "lucide-react";
import { AuditEventMock } from "../../lib/mockData";
import { Skeleton, EmptyState, ErrorBanner } from "../ui";

export interface InitiativeActivityTimelineProps {
  events?: AuditEventMock[];
  loading?: boolean;
  error?: string | null;
}

export function InitiativeActivityTimeline({
  events = [],
  loading = false,
  error = null,
}: InitiativeActivityTimelineProps) {
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
    return <ErrorBanner message={`Failed to load activity timeline: ${error}`} variant="red" />;
  }

  if (!events || events.length === 0) {
    return <EmptyState title="No Activity Logs" description="Actions logged against this initiative will appear here in real-time." variant="dashed" />;
  }

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Initiative Audit & Activity Timeline</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {events.length} Events Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
        {events.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-3 text-xs group">
            <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-primary text-primary-foreground font-semibold text-[9px] flex items-center justify-center border border-border shadow-xs shrink-0">
              {evt.userInitials}
            </div>

            <div className="space-y-1 min-w-0 flex-1 bg-secondary/20 p-3 rounded-lg border border-border/50 group-hover:border-border transition-colors">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground text-xs leading-snug">{evt.title}</p>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{evt.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">{evt.user}</span>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded border font-semibold text-[9px] uppercase bg-accent/10 text-accent border-accent/20">
                  {evt.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
