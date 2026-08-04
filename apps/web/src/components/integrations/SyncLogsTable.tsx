"use client";

import React from "react";
import { History, Download, RefreshCw } from "lucide-react";
import { SyncLogEntry } from "../../types/integration-center";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from "../ui";

export interface SyncLogsTableProps {
  logs: SyncLogEntry[];
}

export function SyncLogsTable({ logs }: SyncLogsTableProps) {
  const handleExportCsv = () => {
    alert("Exporting Synchronization Audit Log (CSV)...");
  };

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden space-y-0">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Synchronization Audit & Latency Logs</h3>
        </div>
        <Button onClick={handleExportCsv} variant="secondary" className="text-[10px] h-7 px-2.5">
          <Download className="w-3 h-3 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <TableHead className="py-3 px-4">Timestamp</TableHead>
              <TableHead className="py-3 px-4">Connector</TableHead>
              <TableHead className="py-3 px-4">Sync Mode</TableHead>
              <TableHead className="py-3 px-4">Records Processed</TableHead>
              <TableHead className="py-3 px-4">Duration (ms)</TableHead>
              <TableHead className="py-3 px-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-secondary/40 transition-colors text-xs font-mono">
                <TableCell className="py-3 px-4 text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="py-3 px-4 font-bold font-sans text-foreground">{log.connectorName}</TableCell>
                <TableCell className="py-3 px-4 font-bold text-accent">{log.syncType}</TableCell>
                <TableCell className="py-3 px-4 text-muted-foreground">{log.recordsProcessed.toLocaleString()}</TableCell>
                <TableCell className="py-3 px-4 font-bold text-foreground">{log.durationMs} ms</TableCell>
                <TableCell className="py-3 px-4 text-right font-sans">
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
