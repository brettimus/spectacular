import { generateObject } from "ai";
import { z } from "zod";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import type { SelectedRule } from "../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

export type IdentifyRulesOptions = {
  schemaSpecification: string;
};

/**
 * Identify relevant rules from schema specification using AI
 */
export async function identifyRules(
  aiConfig: FpAiConfig,
  options: IdentifyRulesOptions,
  noop: boolean,
  signal?: AbortSignal,
): Promise<{ relevantRules: SelectedRule[] }> {
  if (noop) {
    return { relevantRules: [] };
  }
  const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
  const { schemaSpecification } = options;

  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    // In a real implementation, you would load rules from a directory
    // For this prototype, we'll assume a fixed set of example rules
    const rules: Array<string> = [];

    const result = await generateObject({
      model,
      schema: z.object({
        reasoning: z
          .string()
          .describe("Your reasoning for selecting these rules"),
        selectedRules: z.array(
          z.object({
            ruleName: z.string().describe("Name of the rule to apply"),
            reason: z.string().describe("Why this rule is relevant"),
          }),
        ),
      }),
      messages: [
        {
          role: "user",
          content: `Based on this database schema, which rules should be applied?
[DATABASE SCHEMA SPECIFICATION]
${schemaSpecification}
[END DATABASE SCHEMA SPECIFICATION]
***
[AVAILABLE RULES]
${rules.join(", ")}
[END AVAILABLE RULES]`,
        },
      ],
      system: getSystemPrompt(),
      temperature,
      abortSignal: signal,
    });

    return {
      relevantRules: result.object.selectedRules,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Unknown error in identify rules");
  }
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
