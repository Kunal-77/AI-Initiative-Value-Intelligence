"use client";

import React from "react";
import { Download, FileText, Presentation, Table as TableIcon } from "lucide-react";
import { Button } from "../ui";

export function ExecutiveReportsModule() {
  const handleGenerateReport = (title: string, format: string) => {
    alert(`Generating & Downloading ${title} in ${format} format...`);
  };

  const reports = [
    { title: "Executive Board Briefing", desc: "Comprehensive portfolio ROI & strategic alignment report" },
    { title: "CEO Command Summary", desc: "High-level value realization & decision backlog" },
    { title: "CFO Financial Audit Ledger", desc: "CAPEX/OPEX expenditure, DCF valuation & NPV forecasts" },
    { title: "CIO Tech & Infrastructure Report", desc: "GPU compute utilization, model distillation & cloud spend" },
  ];

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Download className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-foreground">Executive Board & C-Suite Report Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {reports.map((r, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-2 flex flex-col justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">{r.title}</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <Button
                onClick={() => handleGenerateReport(r.title, "PDF")}
                variant="secondary"
                className="text-[10px] h-7 px-2 py-0"
              >
                <FileText className="w-3 h-3 mr-1 text-accent" /> PDF
              </Button>
              <Button
                onClick={() => handleGenerateReport(r.title, "PowerPoint")}
                variant="secondary"
                className="text-[10px] h-7 px-2 py-0"
              >
                <Presentation className="w-3 h-3 mr-1 text-amber-500" /> PPT
              </Button>
              <Button
                onClick={() => handleGenerateReport(r.title, "CSV")}
                variant="secondary"
                className="text-[10px] h-7 px-2 py-0"
              >
                <TableIcon className="w-3 h-3 mr-1 text-emerald-500" /> CSV
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
