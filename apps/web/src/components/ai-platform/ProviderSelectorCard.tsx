"use client";

import React from "react";
import { Cpu, Sliders, ShieldCheck, Zap } from "lucide-react";
import { LlmProviderId, LlmModelConfig } from "../../types/ai-platform";
import { providerRegistry } from "../../services/ai/providers/providerRegistry";
import { Select, Label, Input } from "../ui";

export interface ProviderSelectorCardProps {
  config: LlmModelConfig;
  onChange: (updated: LlmModelConfig) => void;
}

export function ProviderSelectorCard({ config, onChange }: ProviderSelectorCardProps) {
  const providers = providerRegistry.getAllProviders();
  const currentProvider = providerRegistry.getProvider(config.providerId);

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Multi-Provider LLM Engine Selection</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
          Provider Agnostic
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <Label>Active AI Provider</Label>
          <Select
            value={config.providerId}
            onChange={(e) => {
              const newId = e.target.value as LlmProviderId;
              const p = providerRegistry.getProvider(newId);
              onChange({
                ...config,
                providerId: newId,
                modelName: p.availableModels[0] || "default",
              });
            }}
            className="text-xs"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Target Model</Label>
          <Select
            value={config.modelName}
            onChange={(e) => onChange({ ...config, modelName: e.target.value })}
            className="text-xs"
          >
            {currentProvider.availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Temperature ({config.temperature})</Label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => onChange({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full h-8 accent-accent"
          />
        </div>

        <div>
          <Label>Max Output Tokens</Label>
          <Input
            type="number"
            value={config.maxTokens}
            onChange={(e) => onChange({ ...config, maxTokens: parseInt(e.target.value) || 1024 })}
            className="text-xs h-8 py-1"
          />
        </div>
      </div>
    </div>
  );
}
