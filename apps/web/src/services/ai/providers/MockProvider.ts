"use client";

import { ILlmProvider } from "./ILlmProvider";
import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export class MockProvider implements ILlmProvider {
  readonly id: LlmProviderId = "mock";
  readonly displayName = "Value Intel Mock Engine";
  readonly availableModels = ["mock-gpt-4o", "mock-gemini-1.5-pro", "mock-claude-3.5-sonnet"];

  async generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const startTime = performance.now();
    const text = `[Mock Provider Response] Analysis generated for: "${request.prompt.substring(0, 50)}...". Strategic alignment: 94%. Expected ROI boost: +215%. Risk level: Low.`;
    const latencyMs = Math.round(performance.now() - startTime + 320);

    return {
      text,
      promptTokens: 142,
      completionTokens: 88,
      costUsd: 0.0012,
      latencyMs,
      modelName: "mock-gpt-4o",
      providerId: this.id,
      confidenceScore: 94,
    };
  }

  async generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse> {
    const startTime = performance.now();
    const chunks = [
      "Executive Decision Intelligence Summary:\n\n",
      "1. Strategic Value: Initiative demonstrates strong alignment with core ROI targets.\n",
      "2. Financial Projections: Net Present Value estimated at +$4.94M over 36 months.\n",
      "3. Governance SLA: Fast-track approval recommended for Executive Gate 3.\n",
    ];

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 120));
      onChunk(chunk);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    return {
      text: chunks.join(""),
      promptTokens: 142,
      completionTokens: 96,
      costUsd: 0.0014,
      latencyMs,
      modelName: "mock-gpt-4o",
      providerId: this.id,
      confidenceScore: 95,
    };
  }
}
