import type { Context } from "@/context";
import type { ErrorInfo } from "@/utils/typechecking/types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { ApiErrorAnalysisResult } from "./types";

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

export const analyzeApiErrorsActor = fromPromise<
  ApiErrorAnalysisResult | null,
  {
    context: Context;
    apiCode: string;
    errors: ErrorInfo[];
  }
>(async ({ input, signal }) => {
  try {
    const { context, apiCode, errors } = input;
    const openai = createOpenAI({ apiKey: context.apiKey });
    const model = traceAISDKModel(openai.responses("gpt-4o"));

    log("debug", "Analyzing API errors", {
      errorsCount: errors.length,
      apiCodeLength: apiCode.length,
    });

    const prompt = generateApiErrorAnalysisPrompt(apiCode, errors);

    const result = await generateText({
      model,
      prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
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
});
