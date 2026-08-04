"use client";

import { ILlmProvider } from "./ILlmProvider";
import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export class OllamaProvider implements ILlmProvider {
  readonly id: LlmProviderId = "ollama";
  readonly displayName = "Local Ollama (Llama 3)";
  readonly availableModels = ["llama3:8b", "llama3:70b", "mistral:7b", "codellama:13b"];

  async generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const text = `[Local Ollama Response] On-premise offline inference: "${request.prompt.substring(0, 40)}...". Zero external network egress.`;
    return {
      text,
      promptTokens: 150,
      completionTokens: 90,
      costUsd: 0.0,
      latencyMs: 240,
      modelName: "llama3:8b",
      providerId: this.id,
      confidenceScore: 89,
    };
  }

  async generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse> {
    const chunks = [
      "[Local Ollama Llama3 Streaming]\n",
      "On-Premise Private Inference:\n",
      "• Egress Cost: $0.00 (Local Compute)\n",
    ];

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 80));
      onChunk(chunk);
    }

    return {
      text: chunks.join(""),
      promptTokens: 150,
      completionTokens: 95,
      costUsd: 0.0,
      latencyMs: 260,
      modelName: "llama3:8b",
      providerId: this.id,
      confidenceScore: 89,
    };
  }
}
