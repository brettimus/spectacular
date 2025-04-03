import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
// import type { TextResultSource } from "ai"; // Removed as it's not exported
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { FpModelProvider } from "../../ai-model-factory";
import { aiModelFactory } from "../../ai-model-factory";
import type { ErrorInfo } from "@/utils/typechecking/types";

// Infer the sources type from the generateText return type
type GenerateTextReturnType = Awaited<ReturnType<typeof generateText>>;
type SourcesType = GenerateTextReturnType["sources"];

// Result type remains the same, using any for sources type for now
export type ApiErrorAnalysisResult = {
  text: string;
  sources: SourcesType; // Use the inferred type
};

const OPENAI_STRATEGY = {
  modelName: "gpt-4o",
  modelProvider: "openai",
  responsesApi: true,
} as const;

const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
} as const;

// TODO - MODEL PROVIDER OPTIONS SHOULD BE PART OF STRATEGY
/**
 * Analyze API errors using AI
 */
export async function analyzeApiErrors(
  apiKey: string,
  apiCode: string,
  errors: ErrorInfo[],
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<ApiErrorAnalysisResult | null> {
  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

    log("debug", "Analyzing API errors", {
      errorsCount: errors.length,
      apiCodeLength: apiCode.length,
    });

    const prompt = generateApiErrorAnalysisPrompt(apiCode, errors);

    const result = await generateText({
      model,
      prompt,
      // Assuming tools might vary based on provider/model
      tools: {
        // TODO - Need to configure this based on the model provider!!!
        web_search_preview: createOpenAI({
          apiKey,
          baseURL: aiGatewayUrl,
        }).tools.webSearchPreview(),
      },
      abortSignal: signal,
    });

    log("info", "API error analysis complete", {
      resultLength: result.text.length,
      hasWebSearchResults: Boolean(result.sources),
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
        : new Error("Unknown error in analyze API errors"),
    );
    return null;
  }
}

/**
 * Generate a prompt for the AI to analyze API errors
 */
function generateApiErrorAnalysisPrompt(
  apiCode: string,
  errorMessages: ErrorInfo[],
): string {
  return `
I'm trying to create a Hono API with Drizzle ORM using Cloudflare Workers. Here's my current index.ts file:

${apiCode}

However, I'm getting these TypeScript errors:

${JSON.stringify(errorMessages, null, 2)}

What's causing these errors and how should I fix my index.ts file?

Please search the internet for the latest Hono.js and Drizzle ORM documentation to help resolve these TypeScript errors.
Focus specifically on:
- Proper Hono type declarations for Cloudflare Workers
- Correct usage of Drizzle ORM with D1 database
- Any type issues with request/response handling
`;
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
