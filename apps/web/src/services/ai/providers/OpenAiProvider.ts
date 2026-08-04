"use client";

import { ILlmProvider } from "./ILlmProvider";
import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export class OpenAiProvider implements ILlmProvider {
  readonly id: LlmProviderId = "openai";
  readonly displayName = "OpenAI API (GPT-4o)";
  readonly availableModels = ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini"];

  async generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const text = `[OpenAI GPT-4o Response] Executive analysis completed for: "${request.prompt.substring(0, 40)}...". Financial valuation NPV: +$4.94M.`;
    return {
      text,
      promptTokens: 180,
      completionTokens: 110,
      costUsd: 0.0035,
      latencyMs: 410,
      modelName: "gpt-4o",
      providerId: this.id,
      confidenceScore: 92,
    };
  }

  async generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse> {
    const chunks = [
      "[OpenAI GPT-4o Streaming]\n",
      "Executive Financial Evaluation:\n",
      "• NPV: $4.94M (12% Discount Rate)\n",
      "• Confidence Score: 92%\n",
    ];

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 100));
      onChunk(chunk);
    }

    return {
      text: chunks.join(""),
      promptTokens: 180,
      completionTokens: 115,
      costUsd: 0.0038,
      latencyMs: 420,
      modelName: "gpt-4o",
      providerId: this.id,
      confidenceScore: 92,
    };
  }
}
