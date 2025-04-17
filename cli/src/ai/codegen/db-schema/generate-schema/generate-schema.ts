import { log } from "../../../../utils/logging/logger";
import { generateObject } from "ai";
import { z } from "zod";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { ANTHROPIC_STRATEGY } from "./anthropic";
import { OPENAI_STRATEGY } from "./openai";

export type GenerateSchemaOptions = {
  schemaSpecification: string;
};

export type GenerateSchemaResult = z.infer<typeof GenerateSchemaSchema>;

const GenerateSchemaSchema = z.object({
  explanation: z
    .string()
    .describe("Explanation of your schema design decisions"),
  dbSchemaTs: z
    .string()
    .describe("The generated Drizzle typescript schema definition."),
});

/**
 * Generate Drizzle ORM schema using AI
 */
export async function generateSchema(
  aiConfig: FpAiConfig,
  options: GenerateSchemaOptions,
  signal?: AbortSignal,
): Promise<GenerateSchemaResult> {
  try {
    const { schemaSpecification } = options;
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    log("debug", "Generating schema for db spec", {
      specLength: schemaSpecification.length,
    });

    const result = await generateObject({
      model,
      schema: GenerateSchemaSchema,
      messages: [
        {
          role: "user",
          content: createUserPrompt({
            schemaSpecification,
          }),
        },
      ],
      system: getSystemPrompt(),
      maxTokens: 32_000,
      temperature,
      abortSignal: signal,
    });

    log("info", "Schema generation complete", {
      explanation: result.object.explanation,
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

const createUserPrompt = ({
  schemaSpecification,
}: { schemaSpecification: string }) => `<context>
${schemaSpecification}
</context>

<task>
Generate a Drizzle ORM schema definition for the database tables described in the context.
This is important to my career.
</task>
`;

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
