"use client";

import React from "react";
import { History, Download, ShieldCheck } from "lucide-react";
import { AdminAuditLog } from "../../types/admin";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from "../ui";

export interface AuditCenterTableProps {
  logs: AdminAuditLog[];
}

export function AuditCenterTable({ logs }: AuditCenterTableProps) {
  const handleExportCsv = () => {
    alert("Exporting Enterprise System Audit Log (CSV)...");
  };

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Enterprise System & Security Audit Center</h3>
        </div>
        <Button onClick={handleExportCsv} variant="secondary" className="text-[10px] h-7 px-2.5">
          <Download className="w-3 h-3 mr-1" /> Export Audit CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Timestamp</TableHead>
              <TableHead className="py-3 px-4">Actor</TableHead>
              <TableHead className="py-3 px-4">Action</TableHead>
              <TableHead className="py-3 px-4">Target Resource</TableHead>
              <TableHead className="py-3 px-4">Category</TableHead>
              <TableHead className="py-3 px-4 text-right">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-secondary/40 transition-colors text-xs">
                <TableCell className="py-3 px-4 font-mono text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="py-3 px-4 font-semibold text-foreground">{log.actor}</TableCell>
                <TableCell className="py-3 px-4 font-mono font-bold text-accent text-[11px]">{log.action}</TableCell>
                <TableCell className="py-3 px-4 text-muted-foreground">{log.target}</TableCell>
                <TableCell className="py-3 px-4">
                  <Badge variant="info">{log.category}</Badge>
                </TableCell>
                <TableCell className="py-3 px-4 text-right font-mono text-muted-foreground">{log.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
