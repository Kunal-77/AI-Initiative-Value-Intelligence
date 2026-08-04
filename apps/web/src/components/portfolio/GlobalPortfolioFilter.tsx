"use client";

import React from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Input, Select, Button } from "../ui";
import { GlobalPortfolioFilters } from "../../types/portfolio";

export interface GlobalPortfolioFilterProps {
  filters: GlobalPortfolioFilters;
  onChange: (updated: GlobalPortfolioFilters) => void;
  onReset: () => void;
}

export function GlobalPortfolioFilter({
  filters,
  onChange,
  onReset,
}: GlobalPortfolioFilterProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Global Executive Command Center Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3 h-3" /> Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
        <Input
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Global portfolio search..."
          className="text-xs h-8 py-1"
        />

        <Select
          value={filters.businessArea}
          onChange={(e) => onChange({ ...filters, businessArea: e.target.value })}
          className="text-xs h-8 py-1"
        >
          <option value="ALL">All Business Areas</option>
          <option value="Operations & Care">Operations & Care</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Legal & Compliance">Legal & Compliance</option>
          <option value="Finance & Risk Analytics">Finance & Risk Analytics</option>
        </Select>

        <Select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="text-xs h-8 py-1"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="DRAFT">DRAFT</option>
        </Select>

        <Select
          value={filters.riskLevel}
          onChange={(e) => onChange({ ...filters, riskLevel: e.target.value })}
          className="text-xs h-8 py-1"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </Select>

        <Select
          value={filters.dateRange}
          onChange={(e) => onChange({ ...filters, dateRange: e.target.value })}
          className="text-xs h-8 py-1"
        >
          <option value="Q3_2026">Q3 FY2026 (Current)</option>
          <option value="FY2026">Full Year FY2026</option>
          <option value="ALL_TIME">All Time Portfolio</option>
        </Select>
      </div>
    </div>
  );
}
