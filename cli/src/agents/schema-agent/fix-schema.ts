import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";

/**
 * Generate a fixed schema based on the analysis results
 *
 * NOTE - Cannot use experimental predictive outputs with a tool call,
 *        so we just use generateText
 */
export async function fixSchemaErrors(
  ctx: Context,
  originalFile: string,
  fixContent: string,
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  try {
    const result = await generateText({
      model,
      system: `
You are a world class software engineer, and an expert in Drizzle ORM, a relational database query building library written in Typescript.

Here are some key things to remember when writing Drizzle ORM schemas:
- \`.primaryKey().autoIncrement()\` is NOT VALID for D1
  BETTER: use \`.primaryKey({ autoIncrement: true })\` instead
- Make sure all dependencies are properly imported
- IMPORTANT: \`import { sql } from "drizzle-orm"\`, not from \`drizzle-orm/sqlite-core\`
- Relations must be properly defined using the relations helper from drizzle-orm
- For SQLite tables, use \`sqliteTable\` from \`drizzle-orm/sqlite-core\`
- For indexes, use \`index\` and \`uniqueIndex\` from \`drizzle-orm/sqlite-core\`

When defining relations:
- Use \`one\` for one-to-one or many-to-one relations
- Use \`many\` for one-to-many or many-to-many relations
- Always specify \`fields\` (the foreign key fields in the current table)
- Always specify \`references\` (the primary key fields in the referenced table)
`,
      messages: [
        {
          role: "user",
          content: `
I need you to generate a fixed version of a Drizzle ORM schema.ts file. The original schema had TypeScript errors that were analyzed, and I'm providing you with the analysis results.

Here's the analysis of the schema errors:

${fixContent}

Based on this analysis, generate a corrected schema.ts file that fixes all the issues identified.

Return only the fixed schema code. It should be valid TypeScript code. DO NOT INCLUDE A CHAT MESSAGE WITH THE FIXED CODE IN MARKDOWN!
`,
        },
      ],
      temperature: 0.2,
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: "content",
            content: originalFile,
          },
        },
      },
    });

    return result.text;
  } catch (error) {
    console.error("Error generating fixed schema:", error);
    return null;
  }
}
