import { generateObject } from "ai";
import { z } from "zod";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";
import type { SelectedRule } from "../../types";

export type GenerateSchemaOptions = {
  schemaSpecification: string;
  relevantRules: SelectedRule[];
};

export type GenerateSchemaResult = {
  explanation: string;
  dbSchemaTs: string;
};

/**
 * Generate Drizzle ORM schema using AI
 */
export async function generateSchema(
  aiConfig: FpAiConfig,
  options: GenerateSchemaOptions,
  signal?: AbortSignal,
): Promise<GenerateSchemaResult> {
  try {
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    log("debug", "Generating schema", {
      specLength: options.schemaSpecification.length,
      rulesCount: options.relevantRules.length,
    });

    const result = await generateObject({
      model,
      schema: z.object({
        explanation: z
          .string()
          .describe("Explanation of your schema design decisions"),
        dbSchemaTs: z
          .string()
          .describe("The generated Drizzle typescript schema definition."),
      }),
      messages: [
        {
          role: "user",
          content: `Generate Drizzle ORM schema code for the following tables:
 
[BEGIN DATA]
************
[specification]:
${options.schemaSpecification}
************
[Additional context]:
${JSON.stringify(options.relevantRules, null, 2)}
************
[END DATA]

Use the additional context to help you generate the schema.

This is important to my career.`,
        },
      ],
      system: getSystemPrompt(),
      temperature,
      abortSignal: signal,
    });

    log("info", "Schema generation complete", {
      explanationLength: result.object.explanation.length,
      schemaLength: result.object.dbSchemaTs.length,
    });

    return {
      explanation: result.object.explanation,
      dbSchemaTs: result.object.dbSchemaTs,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in generate schema"),
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
