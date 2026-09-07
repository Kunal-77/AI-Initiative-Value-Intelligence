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
    <div className="rounded-xl border border-[#202630] bg-[#11151C]/90 text-[#F4F1EA] shadow-sm overflow-hidden space-y-0 backdrop-blur-xl">
      <div className="p-4 border-b border-[#202630] bg-[#171C24]/50 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#7DA7D9]/10 border border-[#7DA7D9]/20 text-[#7DA7D9]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#F4F1EA]">Executive Governance & Approval Queue</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7DA7D9]/10 text-[#7DA7D9] border border-[#7DA7D9]/20 font-bold">
            {filtered.length} Items Pending
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex gap-1.5 text-[11px] flex-wrap">
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
                className={`px-3 py-1 rounded-lg border font-medium transition-all duration-200 cursor-pointer ${filterTab === tab.id
                    ? "bg-[#7DA7D9]/20 text-[#7DA7D9] border-[#7DA7D9]/40 font-bold shadow-xs"
                    : "bg-[#171C24] text-[#8F98A8] border-[#202630] hover:bg-[#202630] hover:text-[#F4F1EA]"
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
            className="text-xs h-8 sm:w-60 py-1 bg-[#171C24] border-[#202630] text-[#F4F1EA] placeholder:text-[#8F98A8] focus:border-[#7DA7D9]/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#171C24]/30 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8F98A8] border-b border-[#202630]">
              <TableHead className="py-3 px-4">Initiative & Sponsor</TableHead>
              <TableHead className="py-3 px-4">Business Area</TableHead>
              <TableHead className="py-3 px-4">Current Stage</TableHead>
              <TableHead className="py-3 px-4">Requested Budget</TableHead>
              <TableHead className="py-3 px-4 text-center">AI Confidence</TableHead>
              <TableHead className="py-3 px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#202630]">
            {filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-[#7DA7D9]/5 transition-colors text-xs">
                <TableCell className="py-3.5 px-4 font-semibold text-[#F4F1EA]">
                  {item.initiativeName}
                  <span className="block text-[10px] text-[#8F98A8] font-normal">Requested by: {item.requestedBy}</span>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-[#D9DEE7]">{item.businessArea}</TableCell>
                <TableCell className="py-3.5 px-4">
                  <Badge variant={item.currentStage === "APPROVED" ? "ACTIVE" : item.currentStage === "REJECTED" ? "ABANDONED" : "SUBMITTED"}>
                    {item.currentStage}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-semibold text-[#F4F1EA]">
                  ${(item.requestedBudget / 1000).toFixed(0)}k
                </TableCell>
                <TableCell className="py-3.5 px-4 text-center font-mono font-bold text-[#7DA7D9]">
                  <span>{item.aiConfidenceScore}%</span>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Button
                    onClick={() => onSelectApproval(item)}
                    variant="primary"
                    className="text-[10px] h-7 px-3 bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8] font-bold shadow-xs cursor-pointer"
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
