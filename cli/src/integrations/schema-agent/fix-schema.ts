import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { createUserMessage } from "../utils";
import { SCHEMA_SYSTEM_PROMPT } from "./analyze-tables";

export async function fixSchemaErrors(
  ctx: Context,
  schema: string,
  errorMessage: string,
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  return generateObject({
    model,
    schema: z.object({
      fixedSchema: z.string().describe("The fixed schema code"),
      explanation: z.string().describe("Explanation of the fixes made"),
    }),
    messages: [
      createUserMessage(`Fix the errors in this Drizzle ORM schema:
      
\`\`\`typescript
${schema}
\`\`\`

Error output:
${errorMessage}

Please carefully analyze the error output and fix all issues in the schema.
Return the entire fixed schema, not just the changed parts.`),
    ],
    system: `
${SCHEMA_SYSTEM_PROMPT}

You are now specifically tasked with fixing errors in a Drizzle ORM schema.
Analyze compiler errors and runtime errors carefully to understand the root cause.

Common error types you might encounter:
1. Type errors - Mismatches between expected and provided types
2. Missing imports - Required functions or types not imported
3. Syntax errors - Incorrect Drizzle ORM syntax or TypeScript syntax
4. Reference errors - Attempting to use variables that don't exist
5. Runtime errors - Problems that occur when the schema is used at runtime

When fixing errors:
- Understand the complete context before making changes
- Ensure all imports are correct and complete
- Check for typos in field and table names
- Verify that all referenced variables are defined
- Make sure relationship references are correctly defined
- Add any missing schema components
`,
    temperature: 0.1
  });
}
