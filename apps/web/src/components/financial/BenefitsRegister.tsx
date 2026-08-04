"use client";

import React from "react";
import { FolderKanban, ShieldCheck } from "lucide-react";
import { BenefitItem } from "../../types/financial";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "../ui";

export interface BenefitsRegisterProps {
  benefits: BenefitItem[];
}

export function BenefitsRegister({ benefits }: BenefitsRegisterProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Enterprise Benefits Realization Register</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {benefits.length} Realized Items
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Benefit Name & Initiative</TableHead>
              <TableHead className="py-3 px-4">Owner</TableHead>
              <TableHead className="py-3 px-4">Category</TableHead>
              <TableHead className="py-3 px-4">Target</TableHead>
              <TableHead className="py-3 px-4">Actual</TableHead>
              <TableHead className="py-3 px-4">Variance</TableHead>
              <TableHead className="py-3 px-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {benefits.map((item) => (
              <TableRow key={item.id} className="hover:bg-secondary/40 transition-colors text-xs">
                <TableCell className="py-3.5 px-4 font-semibold text-foreground">
                  {item.benefitName}
                  <span className="block text-[10px] text-muted-foreground font-normal">{item.initiativeName}</span>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground">{item.owner}</TableCell>
                <TableCell className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">{item.category}</TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-semibold text-foreground">
                  ${(item.targetAmount / 1000).toFixed(0)}k
                </TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-semibold text-emerald-500">
                  ${(item.actualAmount / 1000).toFixed(0)}k
                </TableCell>
                <TableCell className="py-3.5 px-4 font-mono font-bold text-emerald-500">
                  {item.varianceAmount >= 0 ? `+$${(item.varianceAmount / 1000).toFixed(0)}k` : `-$${(Math.abs(item.varianceAmount) / 1000).toFixed(0)}k`}
                </TableCell>
                <TableCell className="py-3.5 px-4 text-right">
                  <Badge variant={item.status === "ACHIEVED" ? "ACTIVE" : item.status === "ON_TRACK" ? "SUBMITTED" : "warning"}>
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
