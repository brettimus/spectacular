import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { ApiFixResult } from "./types";

/**
 * Generate a fixed API code based on the analysis results
 *
 * NOTE - Cannot use experimental predictive outputs with a tool call,
 *        so we just use generateText
 */
export const fixApiErrorsActor = fromPromise<
  ApiFixResult | null,
  {
    context: Context;
    fixContent: string;
    originalApiCode: string;
  }
>(async ({ input, signal }) => {
  try {
    const { context, fixContent, originalApiCode } = input;
    const openai = createOpenAI({ apiKey: context.apiKey });
    const model = traceAISDKModel(openai("gpt-4o"));

    log("debug", "Fixing API errors", {
      fixContentLength: fixContent.length,
      originalApiCodeLength: originalApiCode.length,
    });

    const systemPrompt = `
You are a world class software engineer, and an expert in Hono.js and Drizzle ORM for Cloudflare Workers.

Here are some key things to remember when writing Hono APIs for Cloudflare Workers:
- Environment variables must be accessed via the context parameter (c.env), not process.env
- For Drizzle with D1, use \`drizzle(c.env.DB)\` where DB is a D1Database binding
- Properly handle async/await in request handlers
- Ensure proper typing for request and response objects
- Import statements must be correct and complete
- Error handling should be robust
`;

    const userPrompt = `
I need you to generate a fixed version of a Hono.js API file. The original code had TypeScript errors that were analyzed, and I'm providing you with the analysis results.

Here's the original API code:

\`\`\`typescript
${originalApiCode}
\`\`\`

Here's the analysis of the errors:

${fixContent}

Based on this analysis, generate a corrected index.ts file that fixes all the issues identified.

Return only the fixed code. It should be valid TypeScript code. DO NOT INCLUDE A CHAT MESSAGE WITH THE FIXED CODE IN MARKDOWN!
`;

    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.2,
      providerOptions: {
        openai: {
          prediction: {
            type: "content",
            content: originalApiCode,
          },
        },
      },
      abortSignal: signal,
    });

    log("info", "API error fixing complete", {
      resultLength: result.text.length,
    });

    return { code: result.text };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in fix API errors"),
    );
    return null;
  }
});
