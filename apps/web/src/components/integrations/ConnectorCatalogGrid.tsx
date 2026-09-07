"use client";

import React, { useState } from "react";
import { Layers, RefreshCw, CheckCircle2, AlertTriangle, Plug, Power, Activity, Sparkles, Server } from "lucide-react";
import { ConnectorDefinition, ConnectorCategory, ConnectorId } from "../../types/integration-center";
import { Badge, Button, Input, SpotlightCard } from "../ui";

export interface ConnectorCatalogGridProps {
  connectors: ConnectorDefinition[];
  onToggleConnect: (id: ConnectorId) => Promise<void>;
  onSyncNow?: (id: string) => Promise<void>;
  onTriggerSync?: (id: ConnectorId) => Promise<void>;
}

export function ConnectorCatalogGrid({
  connectors,
  onToggleConnect,
  onSyncNow,
  onTriggerSync,
}: ConnectorCatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const categories: ("ALL" | ConnectorCategory)[] = [
    "ALL",
    "Analytics & BI",
    "Collaboration",
    "Project & DevOps",
    "CRM & Enterprise",
    "Cloud Data Warehouse",
    "Developer APIs",
  ];

  const filtered = connectors.filter((c) => {
    const matchesCat = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSync = async (id: string) => {
    try {
      setSyncingId(id);
      if (onSyncNow) {
        await onSyncNow(id);
      } else if (onTriggerSync) {
        await onTriggerSync(id as ConnectorId);
      }
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-[#202630] bg-[#11151C]/95 text-[#F4F1EA] shadow-lg space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202630] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/25 text-[#7DA7D9] shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F4F1EA] flex items-center gap-2">
              Enterprise Connectors & Ecosystem Catalog
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7DA7D9]/15 text-[#7DA7D9] border border-[#7DA7D9]/30">
                {filtered.length} Available
              </span>
            </h3>
            <p className="text-xs text-[#8F98A8]">
              Direct telemetry feeds, cloud warehouse syncs, and webhook ingestion endpoints.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connectors (Power BI, Jira, Snowflake...)"
            className="text-xs h-9 py-1 w-full sm:w-72 bg-[#171C24] border-[#202630] focus:border-[#7DA7D9]/50 text-[#F4F1EA]"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer ${isSelected
                  ? "bg-[#7DA7D9]/15 text-[#7DA7D9] border-[#7DA7D9]/40 shadow-xs font-bold"
                  : "bg-[#171C24] text-[#8F98A8] border-[#202630] hover:bg-[#202630] hover:text-[#F4F1EA]"
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {filtered.map((c) => {
          const isConnected = c.status === "CONNECTED";
          const isWarning = c.status === "WARNING";

          return (
            <SpotlightCard
              key={c.id}
              tiltEnabled={true}
              spotlightColor={isConnected ? "rgba(125, 167, 217, 0.12)" : "rgba(201, 168, 106, 0.10)"}
              className={`p-5 rounded-xl border space-y-4 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden ${isConnected
                  ? "bg-[#11151C]/95 border-[#7DA7D9]/30 hover:border-[#7DA7D9]/60"
                  : isWarning
                    ? "bg-[#11151C]/95 border-amber-500/30 hover:border-amber-500/60"
                    : "bg-[#11151C]/95 border-[#202630] hover:border-[#7DA7D9]/30"
                }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#171C24] border border-[#202630] flex items-center justify-center text-xs font-bold font-mono text-[#7DA7D9] shrink-0 shadow-xs">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-[#F4F1EA] block text-sm group-hover:text-[#7DA7D9] transition-colors">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-[#8F98A8] font-mono">
                        {c.provider} • v{c.version}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isConnected && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    <Badge
                      variant={isConnected ? "ACTIVE" : isWarning ? "warning" : "SUBMITTED"}
                      className="text-[10px] font-mono tracking-wider"
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-[11px] text-[#8F98A8] leading-relaxed">
                  {c.description}
                </p>

                {/* Health Meter */}
                <div className="p-2.5 rounded-lg bg-[#0E1116] border border-[#202630] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#8F98A8] flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#7DA7D9]" /> Health Sync
                    </span>
                    <span className={c.syncHealth >= 95 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {c.syncHealth}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#171C24] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${c.syncHealth >= 95 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      style={{ width: `${c.syncHealth}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#202630] space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#8F98A8]">
                  <span>Category: {c.category}</span>
                  <span>Synced: {c.lastSync}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => onToggleConnect(c.id)}
                    variant={isConnected ? "secondary" : "primary"}
                    className={`text-[11px] h-8 py-0 px-3 flex-1 font-semibold transition-all cursor-pointer ${
                      !isConnected ? "bg-[#7DA7D9] text-[#0B0D11] hover:bg-[#A5C3E8]" : "bg-[#171C24] text-[#F4F1EA] border border-[#202630]"
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 mr-1.5 ${isConnected ? "text-rose-400" : "text-[#0B0D11]"}`} />
                    {isConnected ? "Disconnect" : "Connect"}
                  </Button>

                  {isConnected && (
                    <Button
                      onClick={() => handleSync(c.id)}
                      loading={syncingId === c.id}
                      variant="secondary"
                      className="text-[11px] h-8 py-0 px-3 text-[#7DA7D9] font-bold hover:bg-[#7DA7D9]/10 border-[#7DA7D9]/30 bg-[#171C24] cursor-pointer"
                      title="Manual Trigger Incremental Sync"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#7DA7D9]" /> Sync
                    </Button>
                  )}
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
