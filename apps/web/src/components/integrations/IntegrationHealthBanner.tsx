"use client";

import React from "react";
import { ShieldCheck, Activity, RefreshCw, Key, Database, Layers } from "lucide-react";
import { ConnectorDefinition } from "../../types/integration-center";
import { calculateIntegrationHealth } from "../../lib/integrations/syncEngine";

export interface IntegrationHealthBannerProps {
  connectors: ConnectorDefinition[];
}

export function IntegrationHealthBanner({ connectors }: IntegrationHealthBannerProps) {
  const healthScore = calculateIntegrationHealth(connectors);
  const activeCount = connectors.filter((c) => c.status === "CONNECTED").length;
  const totalRecords = connectors.reduce((sum, c) => sum + c.recordsSynced, 0);

  const cards = [
    { label: "Ecosystem Sync Health", value: `${healthScore}%`, icon: ShieldCheck, color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Active Enterprise Connectors", value: `${activeCount} / ${connectors.length}`, icon: Activity, color: "text-blue-500 dark:text-blue-400" },
    { label: "Synced Records Stream", value: totalRecords.toLocaleString(), icon: Database, color: "text-foreground" },
    { label: "Sync Engine Status", value: "Operational", icon: RefreshCw, color: "text-emerald-500 dark:text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs space-y-1 hover:border-blue-500/40 hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>

            <span className={`text-base sm:text-lg font-extrabold font-mono tracking-tight block ${c.color}`}>
              {c.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
