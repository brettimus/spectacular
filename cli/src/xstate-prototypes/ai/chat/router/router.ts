import { generateObject, type Message } from "ai";
import { z } from "zod";
import { aiModelFactory, type FpModelProvider } from "../../ai-model-factory";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

export type RouterResponse = {
  nextStep: "ask_follow_up_question" | "generate_implementation_plan";
  reasoning: string;
};

// Schema remains the same
const RouterSchema = z.object({
  reasoning: z
    .string()
    .describe("A brief explanation of your reasoning for the classification."),
  nextStep: z.enum(["ask_follow_up_question", "generate_implementation_plan"]),
});

export async function routeRequest(
  apiKey: string,
  messages: Message[],
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<RouterResponse> {
  const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
  const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

  const { object: classification } = await generateObject({
    model,
    schema: RouterSchema,
    messages: messages,
    system: getSystemPrompt(),
    temperature,
    abortSignal: signal,
  });

  return {
    nextStep: classification.nextStep,
    reasoning: classification.reasoning,
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
