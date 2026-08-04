"use client";

import React, { useState } from "react";
import { Plug, Key, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { WebhookDefinition } from "../../types/integration-center";
import { Badge, Button } from "../ui";

export interface WebhookManagementCardProps {
  webhooks: WebhookDefinition[];
}

export function WebhookManagementCard({ webhooks }: WebhookManagementCardProps) {
  const [showSecret, setShowSecret] = useState<string | null>(null);

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Enterprise Webhook Subscriptions & Relays</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          {webhooks.length} Registered Endpoints
        </span>
      </div>

      <div className="space-y-3">
        {webhooks.map((wh) => (
          <div key={wh.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">{wh.name}</span>
              <Badge variant={wh.status === "ACTIVE" ? "ACTIVE" : "warning"}>{wh.status}</Badge>
            </div>

            <div className="p-2 rounded bg-card border border-border font-mono text-[10px] text-muted-foreground flex justify-between items-center">
              <span className="truncate">{wh.endpointUrl}</span>
              <button
                type="button"
                onClick={() => setShowSecret(showSecret === wh.id ? null : wh.id)}
                className="text-accent hover:underline font-bold shrink-0 ml-2"
              >
                {showSecret === wh.id ? wh.secretKey : "Show Secret"}
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground pt-1">
              <span>Direction: <strong className="text-foreground">{wh.direction}</strong></span>
              <span>Deliveries: {wh.deliveriesCount} ({wh.failureCount} Failures) • Last: {wh.lastTriggered}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
