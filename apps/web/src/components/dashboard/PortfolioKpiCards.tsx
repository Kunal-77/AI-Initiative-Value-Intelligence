"use client";

import React from "react";
import { TrendingUp, DollarSign, FolderKanban, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton, EmptyState, ErrorBanner } from "../ui";
import { cn } from "../ui/cn";

export interface KpiCardItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  sparklineData: number[];
}

export interface PortfolioKpiCardsProps {
  data?: KpiCardItem[];
  loading?: boolean;
  error?: string | null;
}

const DEFAULT_KPIS: KpiCardItem[] = [
  {
    id: "value",
    title: "Total Realized Value",
    value: "$4.85M",
    change: "+18.4%",
    isPositive: true,
    subtext: "vs. target baseline $4.10M",
    icon: DollarSign,
    sparklineData: [20, 25, 30, 28, 35, 40, 48],
  },
  {
    id: "roi",
    title: "Average Initiative ROI",
    value: "284%",
    change: "+24.2%",
    isPositive: true,
    subtext: "across 12 active initiatives",
    icon: TrendingUp,
    sparklineData: [180, 200, 210, 230, 250, 270, 284],
  },
  {
    id: "initiatives",
    title: "Active Portfolio Count",
    value: "14",
    change: "+2 new",
    isPositive: true,
    subtext: "2 in review gate, 1 completed",
    icon: FolderKanban,
    sparklineData: [8, 9, 10, 11, 12, 12, 14],
  },
  {
    id: "budget",
    title: "Budget Utilization Rate",
    value: "78.2%",
    change: "-3.1%",
    isPositive: true,
    subtext: "$1.82M spent of $2.33M budget",
    icon: PieChart,
    sparklineData: [60, 65, 70, 72, 75, 76, 78.2],
  },
];

function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = isPositive ? "#10b981" : "#f43f5e";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="motion-draw"
        style={{
          strokeDasharray: 100,
          strokeDashoffset: 100,
          animation: "svgDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
      />
    </svg>
  );
}

export function PortfolioKpiCards({
  data = DEFAULT_KPIS,
  loading = false,
  error = null,
}: PortfolioKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={`Failed to load KPI metrics: ${error}`} variant="red" />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No KPI Data Available" description="Portfolio metrics will appear once initiatives are registered." variant="card" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((kpi, idx) => {
        const Icon = kpi.icon;
        const delayClass = 
          idx === 0 ? "delay-100" :
          idx === 1 ? "delay-200" :
          idx === 2 ? "delay-300" :
          "delay-400";
        return (
          <div
            key={kpi.id}
            className={cn(
              "group relative p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs flex flex-col justify-between gap-3 motion-reveal motion-hover-lift",
              delayClass
            )}
          >
            {/* Top row: Title + Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.title}
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500/15 transition-colors">
                <Icon className="w-4 h-4 text-blue-500" />
              </div>
            </div>

            {/* Middle row: Big Value + Sparkline + Trend Badge */}
            <div className="flex items-end justify-between gap-2 pt-1">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight block motion-number-reveal">
                  {kpi.value}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                {kpi.sparklineData && (
                  <Sparkline data={kpi.sparklineData} isPositive={kpi.isPositive} />
                )}
                <span
                  className={cn(
                    "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border",
                    kpi.isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  )}
                >
                  {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5 shrink-0" /> : <ArrowDownRight className="w-3 h-3 mr-0.5 shrink-0" />}
                  {kpi.change}
                </span>
              </div>
            </div>

            {/* Bottom row: Subtext */}
            <p className="text-[11px] text-muted-foreground/80 truncate border-t border-border/50 pt-2 mt-1">
              {kpi.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
