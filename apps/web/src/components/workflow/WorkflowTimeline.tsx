"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ApprovalStage } from "../../types/workflow";
import { STAGE_ORDER } from "../../lib/workflow/stateMachine";

export interface WorkflowTimelineProps {
  currentStage: ApprovalStage;
}

export function WorkflowTimeline({ currentStage }: WorkflowTimelineProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="p-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-3 motion-reveal motion-hover-lift">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Governance Approval Lifecycle Timeline</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
          Stage: {currentStage}
        </span>
      </div>

      <div className="flex items-center justify-between overflow-x-auto py-2 px-1">
        {STAGE_ORDER.map((stage, idx) => {
          const isDone = idx < currentIndex || currentStage === "APPROVED";
          const isCurrent = idx === currentIndex && currentStage !== "APPROVED";

          return (
            <div
              key={stage}
              className="flex items-center gap-1.5 shrink-0 motion-reveal"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    isDone
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : isCurrent
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40 motion-glow"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={`text-[9px] font-mono uppercase tracking-tighter ${isCurrent ? "text-blue-500 dark:text-blue-400 font-bold" : "text-muted-foreground"}`}>
                  {stage.replace("_", " ")}
                </span>
              </div>

              {idx < STAGE_ORDER.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${idx < currentIndex ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
