"use client";

import React from "react";
import { History } from "lucide-react";
import { AiRecommendation, DecisionHistoryItem } from "../../types/ai";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "../ui";

export interface RecommendationHistoryProps {
  history: AiRecommendation[];
  decisionLogs?: DecisionHistoryItem[];
}

export function RecommendationHistory({ history, decisionLogs }: RecommendationHistoryProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">AI Decision History & Audit Stream</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {history.length} Decision Logs
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Date & Version</TableHead>
              <TableHead className="py-3 px-4">Recommendation</TableHead>
              <TableHead className="py-3 px-4 text-center">Confidence</TableHead>
              <TableHead className="py-3 px-4 text-right">Decision Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {history.map((item) => (
              <TableRow key={item.id} className="hover:bg-secondary/40 transition-colors text-xs">
                <TableCell className="py-3 px-4 font-mono text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                  <span className="block text-[10px]">{item.version}</span>
                </TableCell>
                <TableCell className="py-3 px-4 font-semibold text-foreground">
                  {item.title}
                  <span className="block text-[10px] text-muted-foreground font-normal truncate max-w-xs">{item.initiativeName}</span>
                </TableCell>
                <TableCell className="py-3 px-4 text-center font-mono font-bold text-accent">
                  {item.confidenceScore}%
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <Badge
                    variant={
                      item.status === "ACCEPTED"
                        ? "ACTIVE"
                        : item.status === "REJECTED"
                        ? "ABANDONED"
                        : item.status === "SAVED"
                        ? "SUBMITTED"
                        : "NEUTRAL"
                    }
                  >
                    {item.status}
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
