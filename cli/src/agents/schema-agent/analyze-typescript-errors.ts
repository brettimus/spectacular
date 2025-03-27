import type { Context } from "@/context";
import type { ErrorInfo } from "@/utils/typechecking/types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";

/**
 * Generate a prompt for the AI to analyze schema errors
 */
function generateErrorAnalysisPrompt(
  ctx: Context,
  schema: string,
  errorMessages: ErrorInfo[],
): string {
  return `
I'm trying to create a Drizzle ORM schema based on this specification:

${ctx.specContent}

Here's my current schema.ts file:

${schema}

However, I'm getting these TypeScript errors:

${JSON.stringify(errorMessages, null, 2)}

What's causing these errors and how should I fix my schema.ts file?

Please search the internet for the latest Drizzle ORM documentation on how to define SQLite schemas properly.
`;
}

/**
 * Analyze schema errors using OpenAI and web search
 */
export async function analyzeSchemaErrors(
  ctx: Context,
  schema: string,
  errorMessages: ErrorInfo[],
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  // Use the responses api from openai to do web search
  const model = traceAISDKModel(openai.responses("gpt-4o"));

  try {
    const prompt = generateErrorAnalysisPrompt(ctx, schema, errorMessages);

    const result = await generateText({
      model,
      prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
      },
    });

    return {
      text: result.text,
      sources: result.sources,
    };
  } catch (error) {
    console.error("Error analyzing schema errors:", error);
    return null;
  }
}
