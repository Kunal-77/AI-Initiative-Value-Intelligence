"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, Clock, X, ArrowUpRight, ShieldCheck, Filter } from "lucide-react";
import { ApprovalItem } from "../../types/workflow";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from "../ui";

export interface ApprovalQueueProps {
  approvals: ApprovalItem[];
  loading?: boolean;
  onSelectApproval: (item: ApprovalItem) => void;
}

export function ApprovalQueue({
  approvals,
  loading = false,
  onSelectApproval,
}: ApprovalQueueProps) {
  const [filterTab, setFilterTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = useMemo(() => {
    return approvals.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.initiativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.businessArea.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        filterTab === "ALL" ||
        (filterTab === "PENDING" && item.currentStage !== "APPROVED" && item.currentStage !== "REJECTED") ||
        (filterTab === "APPROVED" && item.currentStage === "APPROVED") ||
        (filterTab === "REJECTED" && item.currentStage === "REJECTED") ||
        (filterTab === "EXECUTIVE" && item.currentStage === "EXECUTIVE_REVIEW");

      return matchesSearch && matchesTab;
    });
  }, [approvals, filterTab, searchQuery]);

  return (
    <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm overflow-hidden space-y-0 motion-reveal motion-hover-lift">
      <div className="p-4 border-b border-border bg-secondary/30 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Executive Governance & Approval Queue</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            {filtered.length} Items
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex gap-1 text-[11px] flex-wrap">
            {[
              { id: "ALL", label: "All Items" },
              { id: "PENDING", label: "Pending Review" },
              { id: "EXECUTIVE", label: "Executive Decision" },
              { id: "APPROVED", label: "Approved" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-2.5 py-1 rounded-md border font-medium transition-all duration-200 active:scale-95 ${
                  filterTab === tab.id
                    ? "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30 font-bold"
                    : "bg-secondary text-muted-foreground border-border hover:bg-secondary/85"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approvals..."
            className="text-xs h-8 sm:w-60 py-1"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Initiative & Requested By</TableHead>
              <TableHead className="py-3 px-4">Business Area</TableHead>
              <TableHead className="py-3 px-4">Current Stage</TableHead>
              <TableHead className="py-3 px-4">Requested Budget</TableHead>
              <TableHead className="py-3 px-4 text-center">AI Confidence</TableHead>
              <TableHead className="py-3 px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-blue-500/5 hover:translate-x-0.5 transition-all duration-150 text-xs">
                <TableCell className="py-3.5 px-4 font-semibold text-foreground">
                  {item.initiativeName}
                  <span className="block text-[10px] text-muted-foreground font-normal">Requested by: {item.requestedBy}</span>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">{item.businessArea}</TableCell>
                <TableCell className="py-3.5 px-4">
                  <Badge variant={item.currentStage === "APPROVED" ? "ACTIVE" : item.currentStage === "REJECTED" ? "ABANDONED" : "SUBMITTED"}>
                    {item.currentStage}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-semibold text-foreground">
                  ${(item.requestedBudget / 1000).toFixed(0)}k
                </TableCell>
                <TableCell className="py-3.5 px-4 text-center font-mono font-bold text-cyan-500 dark:text-cyan-400">
                  <span className="motion-number-reveal">{item.aiConfidenceScore}%</span>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Button
                    onClick={() => onSelectApproval(item)}
                    variant="primary"
                    className="text-[10px] h-7 px-2.5 cta-button-hover"
                  >
                    Review & Decide <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
