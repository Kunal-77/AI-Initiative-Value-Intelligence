"use client";

import React, { useState } from "react";
import { Layers, RefreshCw, CheckCircle2, AlertTriangle, Plug, Power } from "lucide-react";
import { ConnectorDefinition, ConnectorCategory, ConnectorId } from "../../types/integration-center";
import { Badge, Button, Input } from "../ui";

export interface ConnectorCatalogGridProps {
  connectors: ConnectorDefinition[];
  onToggleConnect: (id: ConnectorId) => Promise<void>;
  onTriggerSync: (id: ConnectorId) => Promise<void>;
}

export function ConnectorCatalogGrid({
  connectors,
  onToggleConnect,
  onTriggerSync,
}: ConnectorCatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const categories: string[] = ["ALL", "Analytics & BI", "Collaboration", "Project & DevOps", "Cloud Data Warehouse", "CRM & Enterprise"];

  const filtered = connectors.filter((c) => {
    if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleSync = async (id: ConnectorId) => {
    setSyncingId(id);
    try {
      await onTriggerSync(id);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm space-y-4 motion-reveal motion-hover-lift">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Enterprise Connectors & Ecosystem Catalog</h3>
        </div>

        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connectors (Power BI, Jira, Snowflake...)"
            className="text-xs h-8 py-1 w-64"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto py-1 text-[10px]">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md border font-semibold transition-all duration-200 active:scale-95 shrink-0 ${
              selectedCategory === cat
                ? "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30 font-bold"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            }`}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {filtered.map((c, idx) => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-3 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-xs transition-all duration-200 motion-reveal motion-hover-lift"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-foreground block text-sm">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{c.provider} • v{c.version}</span>
                </div>
                <Badge variant={c.status === "CONNECTED" ? "ACTIVE" : c.status === "WARNING" ? "warning" : "SUBMITTED"} className={c.status === "CONNECTED" ? "animate-pulse" : ""}>
                  {c.status}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-2 border-t border-border/50 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                <span>Health: <strong className="text-emerald-500">{c.syncHealth}%</strong></span>
                <span>Last Sync: {c.lastSync}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={() => onToggleConnect(c.id)}
                  variant={c.status === "CONNECTED" ? "secondary" : "primary"}
                  className="text-[10px] h-7 py-0 px-2.5 flex-1 cta-button-hover"
                >
                  <Power className="w-3 h-3 mr-1" />
                  {c.status === "CONNECTED" ? "Disconnect" : "Connect"}
                </Button>

                {c.status === "CONNECTED" && (
                  <Button
                    onClick={() => handleSync(c.id)}
                    loading={syncingId === c.id}
                    variant="secondary"
                    className="text-[10px] h-7 py-0 px-2 text-accent font-bold cta-button-hover"
                    title="Manual Trigger Incremental Sync"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Sync Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
