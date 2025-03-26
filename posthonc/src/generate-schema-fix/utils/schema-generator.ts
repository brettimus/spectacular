import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { FixedSchema } from '../types';

/**
 * Generate a fixed schema based on the analysis results
 */
export async function generateFixedSchema(fixContent: string): Promise<FixedSchema | null> {
  try {
    console.log('Generating fixed schema using OpenAI...');
    
    const model = openai("gpt-4o");
    
    const result = await generateObject({
      model,
      schema: z.object({
        explanation: z.string().describe("Explanation of the schema design decisions and fixes applied"),
        code: z.string().describe("The fixed Drizzle typescript schema definition")
      }),
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
      messages: [{
        role: "user",
        content: `
I need you to generate a fixed version of a Drizzle ORM schema.ts file. The original schema had TypeScript errors that were analyzed, and I'm providing you with the analysis results.

Here's the analysis of the schema errors:

${fixContent}

Based on this analysis, generate a corrected schema.ts file that fixes all the issues identified.

Return only the fixed schema code and a brief explanation of the changes you made.
`
      }],
      temperature: 0.2,
    });

    return {
      code: result.object.code,
      explanation: result.object.explanation
    };
  } catch (error) {
    console.error("Error generating fixed schema:", error);
    return null;
  }
} 