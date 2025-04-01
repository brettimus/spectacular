import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type {
  SchemaVerificationOptions,
  SchemaVerificationResult,
} from "../types";
import {
  getD1AdditionalTips,
  getD1SchemaExample,
  getDrizzleSchemaExamples,
} from "../generate-schema";

// System prompt for schema verification
const SCHEMA_VERIFICATION_SYSTEM_PROMPT = `
You are a world class software engineer, and an expert in Drizzle ORM, a relational database query building library written in Typescript.

The user has generated a Drizzle ORM schema, and you should verify it for any issues or improvements.

Here is a simple sample Drizzle database schema example for D1:

${getD1SchemaExample()}

Here are some additional code references:

${getDrizzleSchemaExamples()}

[IMPORTANT]

${getD1AdditionalTips()}

[Additional Instructions]

- Make sure all dependencies were properly imported
`;

/**
 * Verify schema using AI
 */
export async function verifySchema(
  apiKey: string,
  options: SchemaVerificationOptions,
  signal?: AbortSignal,
): Promise<SchemaVerificationResult> {
  try {
    const openai = createOpenAI({ apiKey });
    const model = traceAISDKModel(openai("o3-mini"));

    log("debug", "Verifying schema", {
      schemaLength: options.schema.length,
    });

    const result = await generateObject({
      model,
      schema: z.object({
        isValid: z.boolean().describe("Whether the schema is valid"),
        issues: z.array(z.string()).describe("List of issues found, if any"),
        suggestions: z
          .array(z.string())
          .describe("Suggestions for improvement"),
        fixedSchema: z
          .string()
          .describe("The fixed schema, if there were issues"),
      }),
      messages: [
        {
          role: "user",
          content: `Verify this Drizzle ORM schema code and check for any issues or improvements:
      
\`\`\`typescript
${options.schema}
\`\`\``,
        },
      ],
      system: SCHEMA_VERIFICATION_SYSTEM_PROMPT,
      temperature: 0.1,
      abortSignal: signal,
    });

    log("info", "Schema verification complete", {
      isValid: result.object.isValid,
      issuesCount: result.object.issues.length,
      suggestionsCount: result.object.suggestions.length,
    });

    return {
      isValid: result.object.isValid,
      issues: result.object.issues,
      suggestions: result.object.suggestions,
      fixedSchema: result.object.fixedSchema,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in verify schema"),
    );
    throw error;
  }
}

export const verifySchemaActor = fromPromise<
  SchemaVerificationResult,
  { apiKey: string; options: SchemaVerificationOptions }
>(({ input, signal }) => verifySchema(input.apiKey, input.options, signal));
