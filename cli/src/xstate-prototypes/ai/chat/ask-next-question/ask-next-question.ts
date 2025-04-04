import { streamText } from "ai";
import type { Message } from "ai";
import { aiModelFactory } from "../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";
import { ollama } from "ollama-ai-provider";

export type AskNextQuestionOptions = {
  messages: Message[];
};

export async function askNextQuestion(
  aiConfig: FpAiConfig,
  options: AskNextQuestionOptions,
  signal?: AbortSignal,
) {
  const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
  const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
  const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

  return streamText({
    model,
    system: getSystemPrompt(),
    messages: options.messages,
    temperature,
    abortSignal: signal,
  });
}

function getStrategyForProvider(aiProvider: FpModelProvider) {
  switch (aiProvider) {
    case "openai":
      return {
        getSystemPrompt: OPENAI_STRATEGY.getSystemPrompt,
        temperature: OPENAI_STRATEGY.temperature,
      };
    case "anthropic":
      return {
        getSystemPrompt: ANTHROPIC_STRATEGY.getSystemPrompt,
        temperature: ANTHROPIC_STRATEGY.temperature,
      };
    case "ollama":
      return {
        getSystemPrompt: () => "You are a helpful assistant.",
        temperature: 0.7,
      };
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}

function fromModelProvider(
  aiProvider: FpModelProvider,
  apiKey: string,
  aiGatewayUrl?: string,
) {
  switch (aiProvider) {
    case "openai":
      return aiModelFactory({
        apiKey,
        modelDetails: OPENAI_STRATEGY,
        aiGatewayUrl,
      });
    case "anthropic":
      return aiModelFactory({
        apiKey,
        modelDetails: ANTHROPIC_STRATEGY,
        aiGatewayUrl,
      });
    case "ollama":
      return ollama("gemma3:4b");
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
