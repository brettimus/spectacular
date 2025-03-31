import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { ApiVerificationOptions, ApiVerificationResult } from "./types";

export const verifyApiActor = fromPromise<
  ApiVerificationResult,
  {
    context: Context;
    options: ApiVerificationOptions;
  }
>(async ({ input, signal }) => {
  try {
    const { context, options } = input;
    const openai = createOpenAI({ apiKey: context.apiKey });
    const model = traceAISDKModel(openai("o3-mini"));

    const VERIFICATION_PROMPT = `
You are a code reviewer examining a generated API for a Hono.js application.
The API is intended to work with a database schema using Drizzle ORM.

Database Schema:
\`\`\`typescript
${options.schema}
\`\`\`

Generated API:
\`\`\`typescript
${options.apiCode}
\`\`\`

Carefully review the generated API and identify any issues related to:

1. Syntax errors or typos
2. Type issues with Hono.js and Cloudflare Workers
3. Incorrect usage of Drizzle ORM
4. Improper request/response handling
5. Missing error handling or validation
6. Incomplete implementation of the schema's tables and relationships
7. Security concerns

Identify if there are any critical issues that would prevent the API from working.
For each issue, provide a clear explanation of the problem and how it should be fixed.

Rate the overall quality of the generated API on a scale of 1-5 and explain your rating.
`;

    log("debug", "Verifying API code", {
      schemaLength: options.schema.length,
      apiCodeLength: options.apiCode.length,
    });

    const result = await generateObject({
      model,
      schema: z.object({
        valid: z
          .boolean()
          .describe("Whether the API code is valid and workable"),
        issues: z
          .array(z.string())
          .describe(
            "List of issues found in the API code that should be fixed",
          ),
        rating: z
          .number()
          .min(1)
          .max(5)
          .describe("Overall quality rating of the API code (1-5)"),
        explanation: z
          .string()
          .describe("Explanation of the rating and overall assessment"),
      }),
      prompt: VERIFICATION_PROMPT,
      temperature: 0.2,
      abortSignal: signal,
    });

    log("info", "API verification complete", {
      valid: result.object.valid,
      issuesCount: result.object.issues.length,
      rating: result.object.rating,
    });

    return {
      valid: result.object.valid,
      issues: result.object.issues,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error ? error : new Error("Unknown error in verify API"),
    );
    throw error;
  }
});
