import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { createUserMessage } from "../utils";

export const SCHEMA_SYSTEM_PROMPT = `
You are an expert database schema designer specializing in Drizzle ORM with SQLite (D1).
Your task is to analyze a software specification and create an appropriate database schema.

The schema should follow best practices for relational database design:
- Use appropriate data types
- Define proper relationships (foreign keys)
- Include timestamps where appropriate
- Use indexes for columns that will be frequently queried
- Follow naming conventions (snake_case for tables and columns)

The output should be valid TypeScript code using Drizzle ORM syntax for SQLite (D1).
`;

export async function analyzeDatabaseTables(ctx: Context) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  // Ensure we have the spec content
  if (!ctx.specContent) {
    throw new Error("Spec content is required for schema analysis");
  }

  return generateObject({
    model,
    schema: z.object({
      reasoning: z
        .string()
        .describe(
          "Your analysis of the specification and why you chose these tables.",
        ),
      tables: z.array(
        z.object({
          name: z.string().describe("The name of the table in snake_case"),
          description: z
            .string()
            .describe(
              "A brief description of what this table stores and its purpose",
            ),
          fields: z.array(
            z.object({
              name: z.string().describe("The name of the field in snake_case"),
              type: z.string().describe("The Drizzle data type"),
              isPrimary: z.boolean().describe("Whether this is a primary key"),
              isRequired: z
                .boolean()
                .describe("Whether this field is required"),
              isForeignKey: z
                .boolean()
                .describe("Whether this is a foreign key"),
              references: z
                .string()
                .optional()
                .describe(
                  "If a foreign key, the table and column it references",
                ),
              description: z
                .string()
                .describe("A brief description of this field"),
            }),
          ),
        }),
      ),
    }),
    messages: [
      createUserMessage(`Please analyze this specification and determine the database tables needed:

${ctx.specContent}`),
    ],
    system: SCHEMA_SYSTEM_PROMPT,
    temperature: 0.2
  });
}
