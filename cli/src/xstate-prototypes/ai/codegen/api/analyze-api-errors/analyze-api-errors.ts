import { generateText } from "ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { FpAiConfig, FpModelProvider } from "../../../types";
import { aiModelFactory } from "../../../ai-model-factory";
import type { ErrorInfo } from "@/xstate-prototypes/machines/typechecking/types";
import { OPENAI_STRATEGY } from "./openai";
import { ANTHROPIC_STRATEGY } from "./anthropic";

// Infer the `sources` type from the generateText return type
type GenerateTextReturnType = Awaited<ReturnType<typeof generateText>>;
type SourcesType = GenerateTextReturnType["sources"];

export type AnalyzeApiErrorsResult = {
  text: string;
  sources: SourcesType;
};

export type AnalyzeApiErrorsOptions = {
  apiCode: string;
  errors: ErrorInfo[];
};

/**
 * Analyze API errors using AI
 */
export async function analyzeApiErrors(
  aiConfig: FpAiConfig,
  options: AnalyzeApiErrorsOptions,
  signal?: AbortSignal,
): Promise<AnalyzeApiErrorsResult | null> {
  try {
    const { apiKey, aiProvider, aiGatewayUrl } = aiConfig;
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);
    const { temperature, getTools } = getStrategyForProvider(aiProvider);

    const { apiCode, errors } = options;
    log("debug", "Analyzing API errors", {
      errorsCount: errors.length,
      apiCodeLength: apiCode.length,
    });

    const prompt = generateApiErrorAnalysisPrompt(apiCode, errors);

    const result = await generateText({
      model,
      prompt,
      temperature,
      tools: getTools(apiKey, aiGatewayUrl),
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
