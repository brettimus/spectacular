import { type Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type {
  TypescriptErrorAnalysisOptions,
  SchemaErrorAnalysisResult,
} from "./types";
import type { ErrorInfo } from "@/utils/typechecking/types";

/**
 * Generate a prompt for the AI to analyze schema errors
 */
function generateErrorAnalysisPrompt(
  context: Context,
  schema: string,
  errorMessages: ErrorInfo[],
): string {
  return `
I'm trying to create a Drizzle ORM schema based on this specification:

${context.specContent}

Here's my current schema.ts file:

${schema}

However, I'm getting these TypeScript errors:

${JSON.stringify(errorMessages, null, 2)}

What's causing these errors and how should I fix my schema.ts file?

Please search the internet for the latest Drizzle ORM documentation on how to define SQLite schemas properly.
`;
}

export const analyzeErrorsActor = fromPromise<
  SchemaErrorAnalysisResult | null,
  { context: Context; options: TypescriptErrorAnalysisOptions }
>(async ({ input, signal }) => {
  try {
    const { context, options } = input;
    const openai = createOpenAI({ apiKey: context.apiKey });
    // Use the responses api from openai to do web search
    const model = traceAISDKModel(openai.responses("gpt-4o"));

    log("debug", "Analyzing schema errors", {
      errorsCount: options.errors.length,
    });

    const prompt = generateErrorAnalysisPrompt(
      context,
      options.schema,
      options.errors,
    );

    const result = await generateText({
      model,
      prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
      },
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
});
