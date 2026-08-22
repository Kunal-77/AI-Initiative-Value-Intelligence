"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Skeleton, ErrorBanner, EmptyState } from "../ui";
import { MOCK_MILESTONES, MilestoneMock } from "../../lib/mockData";

export interface UpcomingMilestonesCardProps {
  milestones?: MilestoneMock[];
  loading?: boolean;
  error?: string | null;
}

export function UpcomingMilestonesCard({
  milestones = MOCK_MILESTONES,
  loading = false,
  error = null,
}: UpcomingMilestonesCardProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-2xs">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load milestones: ${error}`} variant="red" />;
  }

  if (!milestones || milestones.length === 0) {
    return <EmptyState title="No Upcoming Milestones" description="Milestone decision gates will appear here." variant="dashed" />;
  }

  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4 hover:border-blue-500/30 transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground truncate" title="Upcoming Decision Gates & Milestones">
            Upcoming Decision Gates & Milestones
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border shrink-0">
          {milestones.length} Pending
        </span>
      </div>

      <div className="space-y-2.5">
        {milestones.map((ms) => (
          <div
            key={ms.id}
            className="p-3 rounded-xl bg-secondary/35 border border-border/70 hover:border-blue-500/30 transition-all flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">{ms.title}</p>
              <p className="text-[10px] text-muted-foreground">
                Owner: {ms.owner} • Due {ms.dueDate}
              </p>
            </div>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                ms.status === "Due Today"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : ms.status === "In Review"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-secondary text-secondary-foreground border-border"
              }`}
            >
              {ms.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
