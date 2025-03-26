import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { logAIInteraction } from "../../utils/logging";
import { createUserMessage } from "../utils";

export const SCHEMA_SYSTEM_PROMPT = `
You are an expert database schema designer specializing in Drizzle ORM with SQLite (Cloudflare D1).

Your task is to analyze a software specification and draft a document describing the appropriate database schema for the project.

The schema should follow best practices for relational database design:
- Use appropriate data types
- Define proper relationships (foreign keys)
- Include timestamps where appropriate
- Use indexes for columns that will be frequently queried
- Follow naming conventions (snake_case for tables and columns)

The output should be a markdown document describing the tables and their relationships.

Use the following outline:
[Outline]
# <name of the project> Database Schema

## Tables

### <table name>

<description of the table>

#### <column name>

- <description of the column>
- <data type>
- <constraints>
  - <primary key? foreign key?>
  - <unique?>
  - <required? nullable?>

### <indexes>

#### <index name>
- <description of the index>
- <columns>
  - <column name>
  - <column name>

## Relations

### <relationship name>

- <description of the relationship>
- <table name>
- <column name>

## Additional Notes and Future Considerations

<description of additional notes and future considerations>

[END OF OUTLINE]
***

Be thorough and detailed. This is important to my career.
`;

export async function analyzeDatabaseTables(ctx: Context) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  // Ensure we have the spec content
  if (!ctx.specContent) {
    throw new Error("Spec content is required for schema analysis");
  }

  const input = {
    prompt: SCHEMA_SYSTEM_PROMPT,
    specification: ctx.specContent,
  };

  const result = await generateObject({
    model,
    schema: z.object({
      reasoning: z
        .string()
        .describe(
          "Your analysis of the specification and why you chose these tables.",
        ),
      schemaSpecification: z
        .string()
        .describe(
          "The detailed database schema specification as a markdown document.",
        ),
    }),
    messages: [
      createUserMessage(`Please analyze this specification and determine the database tables needed:

${ctx.specContent}`),
    ],
    system: SCHEMA_SYSTEM_PROMPT,
    temperature: 0.2,
  });

  // Log the AI interaction
  logAIInteraction(ctx, "create-schema", "analyze-tables", input, result);

  return result;
}
