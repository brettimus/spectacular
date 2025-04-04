import { generateObject } from "ai";
import { z } from "zod";
import { log } from "@/xstate-prototypes/utils/logging/logger";

import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

// Schema definition for the output object
const AnalyzeTablesOutputSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Your analysis of the specification and why you chose these tables.",
    ),
  schemaSpecification: z
    .string()
    .describe(
      "The detailed database schema specification as a markdown document.",
    ),
});

export type AnalyzeTablesResult = z.infer<typeof AnalyzeTablesOutputSchema>;

export type AnalyzeTablesOptions = {
  specContent: string;
};

/**
 * Analyze tables from specification using AI
 */
export async function analyzeTables(
  aiConfig: FpAiConfig,
  options: AnalyzeTablesOptions,
  signal?: AbortSignal,
): Promise<AnalyzeTablesResult> {
  try {
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    // Ensure we have the spec content
    if (!options.specContent) {
      throw new Error("Spec content is required for schema analysis");
    }

    log("debug", "Analyzing database tables", {
      specLength: options.specContent.length,
    });

    const result = await generateObject({
      model,
      schema: AnalyzeTablesOutputSchema,
      messages: [
        {
          role: "user",
          content: `Please analyze this specification and determine the database tables needed:

${options.specContent}`,
        },
      ],
      system: getSystemPrompt(),
      temperature,
      abortSignal: signal,
    });

    log("info", "Table analysis complete", {
      reasoningLength: result.object.reasoning.length,
      specificationLength: result.object.schemaSpecification.length,
    });

    return {
      reasoning: result.object.reasoning,
      schemaSpecification: result.object.schemaSpecification,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in analyze tables"),
    );
    throw error;
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

// Helper function for model selection
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
