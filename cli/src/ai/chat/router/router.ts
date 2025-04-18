import { type Message, generateObject } from "ai";
import { z } from "zod";
import { aiModelFactory } from "../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../types";
import { ANTHROPIC_STRATEGY } from "./anthropic";
import { OPENAI_STRATEGY } from "./openai";

const RouteRequestResponseSchema = z.object({
  explanation: z
    .string()
    .describe("A brief explanation of your choice of next step."),
  nextStep: z.enum(["ask_follow_up_question", "generate_implementation_plan"]),
});

export type RouterResponse = z.infer<typeof RouteRequestResponseSchema>;

export type RouteRequestOptions = {
  messages: Message[];
};

export async function routeRequest(
  aiConfig: FpAiConfig,
  options: RouteRequestOptions,
  signal?: AbortSignal,
): Promise<RouterResponse> {
  const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
  const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
  const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

  const { object: classification } = await generateObject({
    model,
    schema: RouteRequestResponseSchema,
    messages: options.messages,
    system: getSystemPrompt(),
    temperature,
    abortSignal: signal,
  });

  return {
    nextStep: classification.nextStep,
    explanation: classification.explanation,
  };
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
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
