"use client";

import { ILlmProvider } from "./ILlmProvider";
import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export class GeminiProvider implements ILlmProvider {
  readonly id: LlmProviderId = "gemini";
  readonly displayName = "Google Gemini Pro";
  readonly availableModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-ultra"];

  async generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const text = `[Google Gemini 1.5 Pro Response] Analysis completed for prompt: "${request.prompt.substring(0, 40)}...". Multi-modal ROI forecast: +215%.`;
    return {
      text,
      promptTokens: 160,
      completionTokens: 95,
      costUsd: 0.0018,
      latencyMs: 380,
      modelName: "gemini-1.5-pro",
      providerId: this.id,
      confidenceScore: 94,
    };
  }

  async generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse> {
    const chunks = [
      "[Google Gemini 1.5 Pro Streaming]\n",
      "Executive Decision Intelligence:\n",
      "• Portfolio Synergies: High cross-functional impact.\n",
      "• Confidence: 94%\n",
    ];

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 100));
      onChunk(chunk);
    }

    return {
      text: chunks.join(""),
      promptTokens: 160,
      completionTokens: 100,
      costUsd: 0.002,
      latencyMs: 400,
      modelName: "gemini-1.5-pro",
      providerId: this.id,
      confidenceScore: 94,
    };
  }
}
