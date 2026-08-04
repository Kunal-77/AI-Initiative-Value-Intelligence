"use client";

import React from "react";
import { Activity, Clock, DollarSign, Cpu, ShieldCheck } from "lucide-react";
import { AiObservabilityLog } from "../../types/ai-platform";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "../ui";

export interface AiObservabilityDashboardProps {
  logs: AiObservabilityLog[];
}

export function AiObservabilityDashboard({ logs }: AiObservabilityDashboardProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">AI Telemetry, Cost & Observability Stream</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {logs.length} Telemetry Events
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Provider & Model</TableHead>
              <TableHead className="py-3 px-4">Tokens (In / Out)</TableHead>
              <TableHead className="py-3 px-4">Latency (ms)</TableHead>
              <TableHead className="py-3 px-4">Cost (USD)</TableHead>
              <TableHead className="py-3 px-4">Confidence</TableHead>
              <TableHead className="py-3 px-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-secondary/40 transition-colors text-xs font-mono">
                <TableCell className="py-3.5 px-4 font-bold text-foreground font-sans flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div>
                    <span>{log.modelName}</span>
                    <span className="block text-[10px] text-muted-foreground font-normal uppercase">{log.providerId}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">
                  {log.promptTokens} / {log.completionTokens}
                </TableCell>
                <TableCell className="py-3.5 px-4 font-bold text-accent">{log.latencyMs} ms</TableCell>
                <TableCell className="py-3.5 px-4 font-bold text-emerald-500">${log.costUsd.toFixed(4)}</TableCell>
                <TableCell className="py-3.5 px-4 font-bold text-foreground">{log.confidenceScore}%</TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Badge variant={log.status === "SUCCESS" ? "ACTIVE" : "warning"}>
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
