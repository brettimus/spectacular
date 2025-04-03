import { generateObject } from "ai";
import { z } from "zod";
import { aiModelFactory, type FpModelProvider } from "../../ai-model-factory";
import type { SelectedRule } from "@/agents/schema-agent/types";

const OPENAI_STRATEGY = {
  modelName: "gpt-4o",
  modelProvider: "openai",
} as const;

const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
} as const;

// System prompt for rule identification
const RULES_SYSTEM_PROMPT = `
You are an expert in database schema design specializing in selecting the appropriate database rules.
Your task is to analyze a list of database tables and operations and determine which rules should be applied.

A rule is a guideline or pattern for implementing specific database features like authentication, real-time data, etc.
`;

/**
 * Identify relevant rules from schema specification using AI
 */
export async function identifyRules(
  apiKey: string,
  schemaSpecification: string,
  noop: boolean,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
  signal?: AbortSignal,
): Promise<{ relevantRules: SelectedRule[] }> {
  if (noop) {
    return { relevantRules: [] };
  }

  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

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
      system: RULES_SYSTEM_PROMPT,
      temperature: 0,
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
