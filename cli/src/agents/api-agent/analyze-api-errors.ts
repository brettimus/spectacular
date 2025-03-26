import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { ErrorInfo } from "@/utils/typechecking/types";
import { traceAISDKModel } from "evalite/ai-sdk";
import { logAIInteraction } from "../../utils/logging";

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

/**
 * Analyze API errors using OpenAI and web search
 */
export async function analyzeApiErrors(
  ctx: Context,
  apiCode: string,
  errorMessages: ErrorInfo[],
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  // Use the responses api from openai to do web search
  const model = traceAISDKModel(openai.responses("gpt-4o"));

  try {
    const prompt = generateApiErrorAnalysisPrompt(apiCode, errorMessages);

    const input = {
      prompt,
      apiCode,
      errorMessages,
    };

    const result = await generateText({
      model,
      prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
      },
    });

    // Log the AI interaction
    logAIInteraction(ctx, "create-api", "analyze-errors", input, {
      text: result.text,
      sources: Boolean(result.sources),
    });

    return {
      text: result.text,
      sources: result.sources,
    };
  } catch (error) {
    console.error("Error analyzing API errors:", error);
    return null;
  }
}
