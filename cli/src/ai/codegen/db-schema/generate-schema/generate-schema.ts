import { log } from "../../../../utils/logging/logger";
import { streamText } from "ai";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { ANTHROPIC_STRATEGY } from "./anthropic";
import { OPENAI_STRATEGY } from "./openai";

export type GenerateSchemaOptions = {
  schemaSpecification: string;
};

export type GenerateSchemaResult = {
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
    const { schemaSpecification } = options;
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { getSystemPrompt, temperature } = getStrategyForProvider(aiProvider);

    log("debug", "Generating schema for db spec", {
      specLength: schemaSpecification.length,
    });

    const result = await streamText({
      model,
      messages: [
        {
          role: "user",
          content: createUserPrompt({
            schemaSpecification,
          }),
        },
      ],
      system: getSystemPrompt(),
      maxTokens: 16_000,
      temperature,
      abortSignal: signal,
    });

    log("info", "DB Schema generation stream started");

    let hasError = false;
    let errorDetails: null | unknown = null;

    // Process the fullStream to catch any errors
    // NOTE - We also need to consume the stream to trigger the resolution to the promise `result.text`
    for await (const part of result.fullStream) {
      if (part.type === "error") {
        log(
          "error",
          "DB Schema generation encountered an error in the response stream",
          {
            error: part.error,
          },
        );
        hasError = true;
        errorDetails = part.error;
        break;
      }
    }

    if (hasError) {
      throw errorDetails;
    }

    const dbSchemaTs = await result.text;

    log("info", "DB Schema generation complete");

    return {
      dbSchemaTs,
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
