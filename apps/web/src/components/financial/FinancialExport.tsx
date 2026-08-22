"use client";

import React from "react";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import { Button } from "../ui";

export function FinancialExport() {
  const handleExport = (type: string) => {
    alert(`Generating & Exporting ${type}...`);
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-foreground">Executive Financial Reporting Export</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Button
          onClick={() => handleExport("Executive Financial Report (PDF)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5 text-accent" /> Financial Audit (PDF)
        </Button>

        <Button
          onClick={() => handleExport("Portfolio Financial Ledger (CSV)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Portfolio Ledger (CSV)
        </Button>

        <Button
          onClick={() => handleExport("Benefits Realization Register (CSV)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Benefits Register (CSV)
        </Button>

        <Button
          onClick={() => handleExport("Budget & Expense Ledger (CSV)")}
          variant="secondary"
          className="text-xs h-9 justify-start"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Budget Ledger (CSV)
        </Button>
      </div>
    </div>
  );
}
