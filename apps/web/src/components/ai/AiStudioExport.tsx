"use client";

import React from "react";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import { Button } from "../ui";

export function AiStudioExport() {
  const handleExport = (type: string) => {
    alert(`Generating & Exporting Executive ${type}...`);
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-foreground">Executive AI Briefing Export</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Button
          onClick={() => handleExport("AI Briefing (PDF)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5 text-accent" /> Executive Report (PDF)
        </Button>

        <Button
          onClick={() => handleExport("Recommendation Summary (CSV)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Rec. Ledger (CSV)
        </Button>

        <Button
          onClick={() => handleExport("Financial Projections (CSV)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> DCF Forecast (CSV)
        </Button>

        <Button
          onClick={() => handleExport("Audit Decision History (CSV)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Decision Stream (CSV)
        </Button>
      </div>
    </div>
  );
}
