import { generateObject } from "ai";
import { z } from "zod";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import { aiModelFactory, type FpModelProvider } from "../../ai-model-factory";

const OPENAI_STRATEGY = {
  modelName: "o3-mini",
  modelProvider: "openai",
} as const;

// TODO - Add thinking?
const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219",
  modelProvider: "anthropic",
} as const;

// Result type remains the same
export type ApiVerificationResult = z.infer<typeof ApiVerificationSchema>;

// Options type remains internal to this module
type ApiVerificationOptions = {
  schema: string;
  apiCode: string;
};

const ApiVerificationSchema = z.object({
  valid: z.boolean().describe("Whether the API code is valid and workable"),
  issues: z
    .array(z.string())
    .describe("List of issues found in the API code that should be fixed"),
  rating: z
    .number()
    .min(1)
    .max(5)
    .describe("Overall quality rating of the API code (1-5)"),
  explanation: z
    .string()
    .describe("Explanation of the rating and overall assessment"),
});

/**
 * Verify API code using AI
 */
export async function verifyApi(
  apiKey: string,
  options: ApiVerificationOptions,
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<ApiVerificationResult> {
  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

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
      schema: ApiVerificationSchema,
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
      rating: result.object.rating,
      explanation: result.object.explanation,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error ? error : new Error("Unknown error in verify API"),
    );
    throw error;
  }
} 

function fromModelProvider(aiProvider: FpModelProvider, apiKey: string, aiGatewayUrl?: string) {
  switch (aiProvider) {
    case "openai":
      return aiModelFactory({ apiKey, modelDetails: OPENAI_STRATEGY, aiGatewayUrl });
    case "anthropic":
      return aiModelFactory({ apiKey, modelDetails: ANTHROPIC_STRATEGY, aiGatewayUrl });
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
