"use client";

import { ILlmProvider } from "./ILlmProvider";
import { MockProvider } from "./MockProvider";
import { OpenAiProvider } from "./OpenAiProvider";
import { GeminiProvider } from "./GeminiProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { AzureOpenAiProvider } from "./AzureOpenAiProvider";
import { OllamaProvider } from "./OllamaProvider";
import { LlmProviderId } from "../../../types/ai-platform";

class ProviderRegistry {
  private providers: Map<LlmProviderId, ILlmProvider> = new Map();

  constructor() {
    this.register(new MockProvider());
    this.register(new OpenAiProvider());
    this.register(new GeminiProvider());
    this.register(new ClaudeProvider());
    this.register(new AzureOpenAiProvider());
    this.register(new OllamaProvider());
  }

  register(provider: ILlmProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: LlmProviderId): ILlmProvider {
    const p = this.providers.get(id);
    if (!p) return this.providers.get("mock")!;
    return p;
  }

  getAllProviders(): ILlmProvider[] {
    return Array.from(this.providers.values());
  }
}

export const providerRegistry = new ProviderRegistry();
