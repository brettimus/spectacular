import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { createUserMessage } from "../utils";
import {
  getD1SchemaExample,
  getDrizzleSchemaExamples,
} from "./generate-schema";

const SCHEMA_VERIFICATION_SYSTEM_PROMPT = `
You are a world class software engineer, and an expert in Drizzle ORM, a relational database query building library written in Typescript.

The user has generated a Drizzle ORM schema, and you should verify it for any issues or improvements.

Here is a simple sample Drizzle database schema example for D1:

${getD1SchemaExample()}

Here are some additional code references:

${getDrizzleSchemaExamples()}

[Additional Instructions]

- Make sure all dependencies were properly imported
- IMPORTANT: \`import { sql } from "drizzle-orm"\`, not from \`drizzle-orm/sqlite-core'\`
`;

export async function verifyGeneratedSchema(ctx: Context, schema: string) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("o3-mini"));

  return generateObject({
    model,
    schema: z.object({
      isValid: z.boolean().describe("Whether the schema is valid"),
      issues: z.array(z.string()).describe("List of issues found, if any"),
      suggestions: z.array(z.string()).describe("Suggestions for improvement"),
      fixedSchema: z
        .string()
        .describe("The fixed schema, if there were issues"),
    }),
    messages: [
      createUserMessage(`Verify this Drizzle ORM schema code and check for any issues or improvements:
      
\`\`\`typescript
${schema}
\`\`\``),
    ],
    system: SCHEMA_VERIFICATION_SYSTEM_PROMPT,
  });
}
