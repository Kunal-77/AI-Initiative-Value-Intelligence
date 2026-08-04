"use client";

import React from "react";
import { ArrowRight, Sliders } from "lucide-react";
import { FieldMappingRule } from "../../types/integration-center";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "../ui";

export interface DataMappingTableProps {
  mappings: FieldMappingRule[];
}

export function DataMappingTable({ mappings }: DataMappingTableProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Inbound Payload Field Mapping Rules</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {mappings.length} Active Rules
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-2.5 px-3">External JSON Key</TableHead>
              <TableHead className="py-2.5 px-3 text-center">Transformation</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Internal Platform Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {mappings.map((m) => (
              <TableRow key={m.id} className="hover:bg-secondary/40 transition-colors text-xs font-mono">
                <TableCell className="py-2.5 px-3 font-bold text-foreground">{m.externalField}</TableCell>
                <TableCell className="py-2.5 px-3 text-center">
                  <Badge variant="info">{m.transformation}</Badge>
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-bold text-accent">{m.internalField}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
