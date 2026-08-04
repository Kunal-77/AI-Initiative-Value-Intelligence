/**
 * Provider-Agnostic LLM Provider Interface
 */

import { LlmProviderId, LlmCompletionRequest, LlmCompletionResponse } from "../../../types/ai-platform";

export interface ILlmProvider {
  readonly id: LlmProviderId;
  readonly displayName: string;
  readonly availableModels: string[];

  generateCompletion(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
  generateStream(
    request: LlmCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<LlmCompletionResponse>;
}
