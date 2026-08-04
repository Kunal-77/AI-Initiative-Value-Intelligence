/**
 * Strongly Typed Interfaces for Provider-Agnostic AI Platform & Agentic Intelligence
 * Models for Providers, Prompt Library, Agentic Framework, Observability & History.
 */

export type LlmProviderId = "openai" | "azure_openai" | "gemini" | "claude" | "ollama" | "mock";

export interface LlmModelConfig {
  providerId: LlmProviderId;
  modelName: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  streamingEnabled: boolean;
  timeoutMs: number;
  fallbackProviderId?: LlmProviderId;
}

export interface LlmCompletionRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LlmCompletionResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  latencyMs: number;
  modelName: string;
  providerId: LlmProviderId;
  confidenceScore?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: "Executive" | "Financial" | "Risk" | "Workflow" | "Portfolio";
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

export interface AiAgentDefinition {
  id: string;
  name: string;
  role: string;
  goal: string;
  capabilities: string[];
  systemPrompt: string;
  tools: string[];
}

export interface AiObservabilityLog {
  id: string;
  timestamp: string;
  providerId: LlmProviderId;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  costUsd: number;
  status: "SUCCESS" | "FALLBACK" | "FAILED";
  confidenceScore: number;
}

export interface AiHistoryEntry {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  providerId: LlmProviderId;
  modelName: string;
  costUsd: number;
  latencyMs: number;
  actor: string;
}
