import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { logAIInteraction } from "../../utils/logging";

/**
 * Generate a fixed API code based on the analysis results
 */
export async function fixApiErrors(
  ctx: Context,
  fixContent: string,
  originalApiCode: string,
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  try {
    console.log("Generating fixed API code using OpenAI...");

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

Return only the fixed code and a brief explanation of the changes you made.
`;

    const input = {
      systemPrompt,
      userPrompt,
      originalErrors: fixContent,
    };

    const result = await generateObject({
      model,
      schema: z.object({
        explanation: z
          .string()
          .describe("Explanation of the fixes applied to the API code"),
        code: z.string().describe("The fixed Hono API typescript code"),
      }),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.2,
    });

    // Log the AI interaction
    logAIInteraction(ctx, "create-api", "fix-errors", input, {
      explanation: result.object.explanation,
      codeLength: result.object.code.length, // Just log the length instead of the full code
    });

    return {
      code: result.object.code,
      explanation: result.object.explanation,
    };
  } catch (error) {
    console.error("Error generating fixed API code:", error);
    return null;
  }
}
