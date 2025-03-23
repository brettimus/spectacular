import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { createUserMessage } from "../ideation-agent/utils";
import { SCHEMA_SYSTEM_PROMPT } from "./analyze-tables";

export async function verifyGeneratedSchema(ctx: Context, schema: string) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

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
    system: SCHEMA_SYSTEM_PROMPT,
  });
}
