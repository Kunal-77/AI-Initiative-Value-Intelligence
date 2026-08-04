"use client";

import React from "react";
import { Bot, Wrench, Target, Sparkles } from "lucide-react";
import { AGENT_REGISTRY } from "../../lib/ai/agentFramework";
import { Badge } from "../ui";

export function AgentRegistryCard() {
  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Agentic AI Framework & Autonomous Specialist Specs</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          {AGENT_REGISTRY.length} Active Agents
        </span>
      </div>

      <div className="space-y-3">
        {AGENT_REGISTRY.map((agent) => (
          <div key={agent.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> {agent.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-bold">
                {agent.role}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">{agent.goal}</p>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-border/40">
              <div className="flex gap-1">
                {agent.capabilities.map((c, i) => (
                  <span key={i} className="px-1.5 py-0.2 rounded bg-card border border-border text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
              <span className="text-accent font-bold">Tools: {agent.tools.join(", ")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
