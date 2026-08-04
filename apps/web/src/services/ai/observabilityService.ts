/**
 * AI Telemetry & Observability Service Layer
 */

import { AiObservabilityLog, AiHistoryEntry } from "../../types/ai-platform";

export const MOCK_OBSERVABILITY_LOGS: AiObservabilityLog[] = [
  {
    id: "obs_1",
    timestamp: "2026-08-04T12:00:00Z",
    providerId: "openai",
    modelName: "gpt-4o",
    promptTokens: 180,
    completionTokens: 110,
    latencyMs: 410,
    costUsd: 0.0035,
    status: "SUCCESS",
    confidenceScore: 94,
  },
  {
    id: "obs_2",
    timestamp: "2026-08-04T12:15:00Z",
    providerId: "gemini",
    modelName: "gemini-1.5-pro",
    promptTokens: 160,
    completionTokens: 95,
    latencyMs: 380,
    costUsd: 0.0018,
    status: "SUCCESS",
    confidenceScore: 92,
  },
  {
    id: "obs_3",
    timestamp: "2026-08-04T12:30:00Z",
    providerId: "claude",
    modelName: "claude-3-5-sonnet",
    promptTokens: 175,
    completionTokens: 105,
    latencyMs: 390,
    costUsd: 0.003,
    status: "SUCCESS",
    confidenceScore: 96,
  },
];

export const MOCK_AI_HISTORY: AiHistoryEntry[] = [
  {
    id: "hist_1",
    timestamp: "2026-08-04T11:00:00Z",
    prompt: "Analyze financial break-even for Customer Support Automation",
    response: "NPV estimated at +$4.94M with 5.6 months payback period.",
    providerId: "openai",
    modelName: "gpt-4o",
    costUsd: 0.0035,
    latencyMs: 410,
    actor: "Sarah Jenkins (CFO)",
  },
];

export async function getObservabilityLogs(): Promise<AiObservabilityLog[]> {
  return MOCK_OBSERVABILITY_LOGS;
}

export async function getAiHistory(): Promise<AiHistoryEntry[]> {
  return MOCK_AI_HISTORY;
}

export function logAiExecution(log: AiObservabilityLog): void {
  MOCK_OBSERVABILITY_LOGS.unshift(log);
}
