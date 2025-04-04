import { generateText } from "ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { ErrorInfo } from "@/xstate-prototypes/machines/typechecking";
import { aiModelFactory } from "../../../ai-model-factory";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

export type AnalyzeSchemaErrorsResult = {
  text: string;
  sources?: Record<string, unknown>[];
};

export type AnalyzeSchemaErrorsOptions = {
  schemaSpecification: string;
  schema: string;
  errors: ErrorInfo[];
};

/**
 * Analyze schema errors using AI
 */
export async function analyzeSchemaErrors(
  aiConfig: FpAiConfig,
  options: AnalyzeSchemaErrorsOptions,
  signal?: AbortSignal,
): Promise<AnalyzeSchemaErrorsResult | null> {
  const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
  const { schemaSpecification, schema, errors } = options;
  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { temperature, getTools } = getStrategyForProvider(aiProvider);

    log("debug", "Analyzing schema errors", {
      errorsCount: errors.length,
    });

    const prompt = generateErrorAnalysisPrompt(
      schemaSpecification,
      schema,
      errors,
    );

    // Type assertion needed for accessing tools property dynamically
    const result = await generateText({
      model,
      prompt,
      temperature,
      // HACK - Conditionally add web search tools based on the model type and provider
      tools: getTools(apiKey, aiGatewayUrl),
      abortSignal: signal,
    });

    log("info", "Schema error analysis complete", {
      responseLength: result.text.length,
      hasSource: result.sources?.length > 0,
    });

    return {
      text: result.text,
      sources: result.sources,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error while analyzing schema errors"),
    );
    return null;
  }
}

/**
 * Generate a prompt for the AI to analyze schema errors
 */
function generateErrorAnalysisPrompt(
  specContent: string,
  schema: string,
  errorMessages: ErrorInfo[],
): string {
  return `
I'm trying to create a Drizzle ORM schema based on this specification:

${specContent}

Here's my current schema.ts file:

${schema}

However, I'm getting these TypeScript errors:

${JSON.stringify(errorMessages, null, 2)}

What's causing these errors and how should I fix my schema.ts file?

Please search the internet for the latest Drizzle ORM documentation on how to define SQLite schemas properly.
`;
}

function getStrategyForProvider(aiProvider: FpModelProvider) {
  switch (aiProvider) {
    case "openai":
      return {
        temperature: OPENAI_STRATEGY.temperature,
        getTools: OPENAI_STRATEGY.getTools,
      };
    case "anthropic":
      return {
        temperature: ANTHROPIC_STRATEGY.temperature,
        getTools: ANTHROPIC_STRATEGY.getTools,
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
