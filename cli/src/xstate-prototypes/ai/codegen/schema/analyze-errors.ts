import { generateText } from "ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type {
  TypescriptErrorAnalysisOptions,
  SchemaErrorAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import type { ErrorInfo } from "@/xstate-prototypes/typechecking/types";
import { aiModelFactory, type FpModelProvider } from "../../ai-model-factory";
import { createOpenAI } from "@ai-sdk/openai";

// Define strategies
const OPENAI_STRATEGY = {
  modelName: "gpt-4o", // Using gpt-4o with responses for search
  modelProvider: "openai",
  responsesApi: true, // Indicate that we need the .responses() variant
} as const;

const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219", // Example
  modelProvider: "anthropic",
  // Note: Anthropic via ai-sdk might not have direct web search tool like openai.responses
} as const;

/**
 * Analyze schema errors using AI
 */
export async function analyzeErrors(
  apiKey: string,
  options: TypescriptErrorAnalysisOptions,
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<SchemaErrorAnalysisResult | null> {
  const { schemaSpecification, schema, errors } = options;
  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

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
      // HACK - Conditionally add web search tools based on the model type and provider
      tools:
        model.provider === "openai"
          ? {
              web_search_preview: createOpenAI({
                apiKey,
                baseURL: aiGatewayUrl,
              }).tools.webSearchPreview(),
            }
          : undefined,
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
        : new Error("Unknown error in analyze errors"),
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
