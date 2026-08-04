"use client";

import React from "react";
import { Wallet } from "lucide-react";
import { CostItemLedger } from "../../types/financial";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "../ui";

export interface CostRegisterProps {
  costs: CostItemLedger[];
}

export function CostRegister({ costs }: CostRegisterProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Enterprise Capital & Expense Ledger</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {costs.length} Audited Expenses
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Expense & Vendor</TableHead>
              <TableHead className="py-3 px-4">Department</TableHead>
              <TableHead className="py-3 px-4">Category</TableHead>
              <TableHead className="py-3 px-4">Planned</TableHead>
              <TableHead className="py-3 px-4">Actual</TableHead>
              <TableHead className="py-3 px-4">Approval Owner</TableHead>
              <TableHead className="py-3 px-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {costs.map((item) => (
              <TableRow key={item.id} className="hover:bg-secondary/40 transition-colors text-xs">
                <TableCell className="py-3.5 px-4 font-semibold text-foreground">
                  {item.expenseName}
                  <span className="block text-[10px] text-muted-foreground font-normal">Vendor: {item.vendor}</span>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">{item.department}</TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">{item.category}</TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-semibold text-foreground">
                  ${(item.plannedAmount / 1000).toFixed(0)}k
                </TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-semibold text-foreground">
                  ${(item.actualAmount / 1000).toFixed(0)}k
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">{item.approvalOwner}</TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Badge variant={item.status === "APPROVED" ? "ACTIVE" : "SUBMITTED"}>
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
