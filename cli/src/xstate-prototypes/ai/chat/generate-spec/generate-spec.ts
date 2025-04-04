import type { Message } from "ai";
import { generateObject } from "ai";
import { z } from "zod";
import type { FpModelProvider } from "../../ai-model-factory";
import { aiModelFactory } from "../../ai-model-factory";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

// Schema remains the same
export const GeneratedPlanSchema = z.object({
  title: z.string().describe("A title for the project."),
  plan: z
    .string()
    .describe(
      "A detailed implementation plan / handoff document for a developer to implement the project (in markdown).",
    ),
});

export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;

export async function generateSpec(
  apiKey: string,
  messages: Message[],
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<GeneratedPlan> {
  const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
  const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

  const result = await generateObject({
    model,
    system: getSystemPrompt(),
    messages,
    schema: GeneratedPlanSchema,
    temperature,
  });

  return result.object;
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
