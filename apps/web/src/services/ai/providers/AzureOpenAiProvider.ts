"use client";

import { ILlmProvider } from "./ILlmProvider";
import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export class AzureOpenAiProvider implements ILlmProvider {
  readonly id: LlmProviderId = "azure_openai";
  readonly displayName = "Azure OpenAI Service";
  readonly availableModels = ["azure-gpt-4o-enterprise", "azure-gpt-4o-mini"];

  async generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const text = `[Azure OpenAI Response] Enterprise enclave completion: "${request.prompt.substring(0, 40)}...". Private VNet isolated execution.`;
    return {
      text,
      promptTokens: 185,
      completionTokens: 100,
      costUsd: 0.0036,
      latencyMs: 350,
      modelName: "azure-gpt-4o-enterprise",
      providerId: this.id,
      confidenceScore: 93,
    };
  }

  async generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse> {
    const chunks = [
      "[Azure OpenAI Enterprise Streaming]\n",
      "Private VNet Isolated Analysis:\n",
      "• Enterprise Security Score: 100/100\n",
    ];

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 100));
      onChunk(chunk);
    }

    return {
      text: chunks.join(""),
      promptTokens: 185,
      completionTokens: 105,
      costUsd: 0.0038,
      latencyMs: 360,
      modelName: "azure-gpt-4o-enterprise",
      providerId: this.id,
      confidenceScore: 93,
    };
  }
}
