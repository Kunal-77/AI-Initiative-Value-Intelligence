"use client";

import React from "react";
import { Key, ShieldCheck, Lock } from "lucide-react";
import { ApiKeyDefinition } from "../../types/integration-center";
import { Badge } from "../ui";

export interface ApiKeyManagementCardProps {
  apiKeys: ApiKeyDefinition[];
}

export function ApiKeyManagementCard({ apiKeys }: ApiKeyManagementCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Enterprise REST API Keys & Scopes</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
          OAuth 2.0 / Bearer Tokens
        </span>
      </div>

      <div className="space-y-3">
        {apiKeys.map((key) => (
          <div key={key.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">{key.name}</span>
              <Badge variant="ACTIVE">{key.status}</Badge>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
              <span>Token: <strong className="text-accent">{key.keyPrefix}</strong></span>
              <span>Rate Limit: {key.rateLimitPerMin} req/min</span>
            </div>

            <div className="flex gap-1 overflow-x-auto text-[9px] font-mono pt-1 border-t border-border/40">
              {key.scopes.map((s, i) => (
                <span key={i} className="px-1.5 py-0.2 rounded bg-card border border-border text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
