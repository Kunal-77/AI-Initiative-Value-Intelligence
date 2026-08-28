"use client";

import React from "react";
import Link from "@/compat/link";
import { FolderKanban, Sparkles, DollarSign, ShieldCheck, TrendingUp, Layers, ChevronRight } from "lucide-react";

export interface UnifiedLifecycleBarProps {
  activeStep?: "initiative" | "ai" | "financials" | "governance" | "portfolio";
}

export function UnifiedLifecycleBar({ activeStep = "initiative" }: UnifiedLifecycleBarProps) {
  const steps = [
    { id: "initiative", label: "1. Initiative Setup", href: "/business/initiatives", icon: FolderKanban },
    { id: "ai", label: "2. AI Decision Studio", href: "/business/ai-studio", icon: Sparkles },
    { id: "financials", label: "3. Financial Forecast", href: "/business/financials", icon: DollarSign },
    { id: "governance", label: "4. Governance Approval", href: "/business/approvals", icon: ShieldCheck },
    { id: "portfolio", label: "5. Command Center", href: "/business/portfolio", icon: Layers },
  ];

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto gap-2 py-0.5">
        {steps.map((step, idx) => {
          const isActive = step.id === activeStep;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <Link
                href={step.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  isActive
                    ? "bg-accent/15 text-accent border border-accent/30 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </Link>

              {idx < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-border shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
