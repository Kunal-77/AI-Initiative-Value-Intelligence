"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "@/compat/dynamic";
import {
  AppHeader,
  ProviderSelectorCard,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonMetricsRow,
  SkeletonConsole,
  SkeletonCard,
  SkeletonTable,
  LazyViewport,
} from "@/components/ui";

const StreamingConsole = dynamic(
  () => import("@/components/ai-platform/StreamingConsole").then(mod => mod.StreamingConsole),
  { loading: () => <SkeletonConsole /> }
);
const PromptLibraryManager = dynamic(
  () => import("@/components/ai-platform/PromptLibraryManager").then(mod => mod.PromptLibraryManager),
  { loading: () => <SkeletonCard /> }
);
const AgentRegistryCard = dynamic(
  () => import("@/components/ai-platform/AgentRegistryCard").then(mod => mod.AgentRegistryCard),
  { loading: () => <SkeletonCard /> }
);
const AiObservabilityDashboard = dynamic(
  () => import("@/components/ai-platform/AiObservabilityDashboard").then(mod => mod.AiObservabilityDashboard),
  { loading: () => <SkeletonTable rows={3} /> }
);
import {
  LlmModelConfig,
  LlmCompletionResponse,
  AiObservabilityLog,
} from "@/types/ai-platform";
import { providerRegistry } from "@/services/ai/providers/providerRegistry";
import { getObservabilityLogs, logAiExecution } from "@/services/ai/observabilityService";

export default function BusinessAiPlaygroundPage() {
  const { orgId } = useAuth();

  const [config, setConfig] = useState<LlmModelConfig>({
    providerId: "mock",
    modelName: "mock-gpt-4o",
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 1024,
    streamingEnabled: true,
    timeoutMs: 30000,
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamOutput, setStreamOutput] = useState("");
  const [responseMeta, setResponseMeta] = useState<LlmCompletionResponse | null>(null);
  const [logs, setLogs] = useState<AiObservabilityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      getObservabilityLogs().then((res) => {
        setLogs(res);
        setLoading(false);
      });
    }
  }, [orgId]);

  const handleRunStream = async () => {
    setIsStreaming(true);
    setStreamOutput("");
    setResponseMeta(null);

    try {
      const provider = providerRegistry.getProvider(config.providerId);
      const res = await provider.generateStream(
        { prompt: "Synthesize executive strategic value and financial ROI forecast.", temperature: config.temperature },
        (chunk) => setStreamOutput((prev) => prev + chunk)
      );

      setResponseMeta(res);

      // Append log
      const newLog: AiObservabilityLog = {
        id: `obs_${Date.now()}`,
        timestamp: new Date().toISOString(),
        providerId: config.providerId,
        modelName: config.modelName,
        promptTokens: res.promptTokens,
        completionTokens: res.completionTokens,
        latencyMs: res.latencyMs,
        costUsd: res.costUsd,
        status: "SUCCESS",
        confidenceScore: res.confidenceScore || 95,
      };

      logAiExecution(newLog);
      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCancelStream = () => {
    setIsStreaming(false);
    setStreamOutput((prev) => prev + "\n[Stream execution cancelled by user]");
  };

  if (!orgId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="AI Playground & Agent Platform" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors animate-page-entrance">
      <AppHeader badge="AI Playground & Agent Platform" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="ai" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* 1. Multi-Provider Configuration Bar */}
        <ProviderSelectorCard config={config} onChange={setConfig} />

        {/* 2. Main Grid: Streaming Console & Prompts (Left 8) | Agent Framework (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Live Streaming Execution Console */}
            <StreamingConsole
              isStreaming={isStreaming}
              output={streamOutput}
              responseMeta={responseMeta}
              onRunStream={handleRunStream}
              onCancelStream={handleCancelStream}
            />
 
            {/* Versioned Central Prompt Library */}
            <LazyViewport name="Prompt Templates Vault" placeholder={<SkeletonCard />} minHeight="250px">
              {() => <PromptLibraryManager />}
            </LazyViewport>
          </div>
 
          <div className="lg:col-span-4 space-y-6">
            {/* Agentic AI Framework & Specs */}
            <LazyViewport name="Agent Framework Registry" placeholder={<SkeletonCard />} minHeight="300px">
              {() => <AgentRegistryCard />}
            </LazyViewport>
          </div>
        </div>
 
        {/* 3. AI Telemetry & Observability Stream Table */}
        <LazyViewport name="AI Telemetry Logs Stream" placeholder={<SkeletonTable rows={3} />} minHeight="200px">
          {() => <AiObservabilityDashboard logs={logs} />}
        </LazyViewport>
      </main>
    </div>
  );
}
