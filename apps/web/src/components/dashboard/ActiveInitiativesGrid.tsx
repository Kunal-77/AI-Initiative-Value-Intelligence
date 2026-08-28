"use client";

import React from "react";
import Link from "@/compat/link";
import { FolderKanban, ArrowUpRight } from "lucide-react";
import { Badge, SkeletonTable, EmptyState, ErrorBanner, Button } from "../ui";
import { MOCK_INITIATIVES, InitiativeMock } from "../../lib/mockData";

export interface ActiveInitiativesGridProps {
  initiatives?: InitiativeMock[];
  loading?: boolean;
  error?: string | null;
  onNewInitiative?: () => void;
}

export function ActiveInitiativesGrid({
  initiatives = MOCK_INITIATIVES,
  loading = false,
  error = null,
  onNewInitiative,
}: ActiveInitiativesGridProps) {
  if (loading) {
    return <SkeletonTable rows={4} />;
  }

  if (error) {
    return <ErrorBanner message={`Failed to load initiatives: ${error}`} variant="red" />;
  }

  if (!initiatives || initiatives.length === 0) {
    return (
      <EmptyState
        title="No Active Initiatives"
        description="Get started by registering your first strategic AI investment."
        actionText="New Initiative →"
        onActionClick={onNewInitiative}
        variant="dashed"
      />
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm overflow-hidden space-y-0">
      {/* Table Header */}
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
            <FolderKanban className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Strategic Initiatives Portfolio</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {initiatives.length} Active Items
        </span>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">Initiative Name</th>
              <th className="py-3 px-4">Business Area</th>
              <th className="py-3 px-4">Expected Business Outcome</th>
              <th className="py-3 px-4">Value Impact</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {initiatives.map((item) => (
              <tr key={item.id} className="hover:bg-blue-500/5 transition-colors group">
                <td className="py-3.5 px-4 font-semibold text-foreground">
                  <Link
                    href={`/business/initiatives/${item.id}`}
                    className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">{item.businessArea}</td>
                <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                  {item.expectedBusinessOutcome}
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                  {item.valueImpact}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={item.status}>{item.status}</Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/business/initiatives/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    View Details
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
