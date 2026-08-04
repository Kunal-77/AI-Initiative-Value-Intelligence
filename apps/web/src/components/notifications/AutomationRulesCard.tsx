"use client";

import React, { useState } from "react";
import { Zap, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { defaultAutomationEngine, AutomationRule } from "../../lib/automation/ruleEngine";
import { Badge } from "../ui";

export function AutomationRulesCard() {
  const [rules, setRules] = useState<AutomationRule[]>(defaultAutomationEngine.getRules());

  const handleToggle = (id: string) => {
    defaultAutomationEngine.toggleRule(id);
    setRules([...defaultAutomationEngine.getRules()]);
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Event-Driven Automation Center Rules</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          Shared Event Bus Engine
        </span>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">{rule.name}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{rule.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(rule.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 transition-colors ${
                  rule.enabled
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {rule.enabled ? "Rule Enabled" : "Rule Disabled"}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
              <span className="text-accent font-bold">Trigger:</span> {rule.trigger}
              <span>•</span>
              <span className="text-emerald-500 font-bold">Actions:</span> {rule.actions.length} Executable Action(s)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
