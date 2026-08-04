"use client";

import { ILlmProvider } from "./ILlmProvider";
import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export class ClaudeProvider implements ILlmProvider {
  readonly id: LlmProviderId = "claude";
  readonly displayName = "Anthropic Claude 3.5";
  readonly availableModels = ["claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus"];

  async generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const text = `[Anthropic Claude 3.5 Sonnet Response] Reasoning engine analysis: "${request.prompt.substring(0, 40)}...". Risk evaluation: Low.`;
    return {
      text,
      promptTokens: 175,
      completionTokens: 105,
      costUsd: 0.003,
      latencyMs: 390,
      modelName: "claude-3-5-sonnet",
      providerId: this.id,
      confidenceScore: 96,
    };
  }

  async generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse> {
    const chunks = [
      "[Anthropic Claude 3.5 Sonnet Streaming]\n",
      "Governance & Risk Analysis:\n",
      "• Compliance Status: Fully aligned with SOC2 and PII masking policies.\n",
      "• Confidence: 96%\n",
    ];

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 100));
      onChunk(chunk);
    }

    return {
      text: chunks.join(""),
      promptTokens: 175,
      completionTokens: 110,
      costUsd: 0.0032,
      latencyMs: 410,
      modelName: "claude-3-5-sonnet",
      providerId: this.id,
      confidenceScore: 96,
    };
  }
}
