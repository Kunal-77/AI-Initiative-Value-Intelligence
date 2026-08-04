"use client";

import React from "react";
import { History, ArrowRight } from "lucide-react";
import { WorkflowAuditLog } from "../../types/workflow";

export interface AuditLogStreamProps {
  auditLogs: WorkflowAuditLog[];
}

export function AuditLogStream({ auditLogs }: AuditLogStreamProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Workflow Audit Trail & Stage Transitions</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {auditLogs.length} Events
        </span>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-foreground">{log.actor}</span>
              <span className="font-mono text-muted-foreground">
                {new Date(log.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-accent font-bold">
              <span>{log.previousStage}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span>{log.newStage}</span>
            </div>

            {log.reason && <p className="text-[11px] text-muted-foreground pt-0.5">{log.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
