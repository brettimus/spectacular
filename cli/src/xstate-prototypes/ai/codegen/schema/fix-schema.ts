import { generateText } from "ai";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { SchemaFixOptions, SchemaFixResult } from "./types";
import { aiModelFactory, type FpModelProvider } from "../../ai-model-factory";

// Define strategies
const OPENAI_STRATEGY = {
  modelName: "gpt-4o", // Based on original code
  modelProvider: "openai",
} as const;

// TODO - Add Anthropic strategy details if needed
const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219", // Example
  modelProvider: "anthropic",
} as const;

/**
 * Fix schema errors using AI
 */
export async function fixSchema(
  apiKey: string,
  options: SchemaFixOptions,
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<SchemaFixResult | null> {
  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

    log("debug", "Fixing schema errors", {
      fixContentLength: options.fixContent.length,
      originalSchemaLength: options.originalSchema.length,
    });

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

${options.fixContent}

Based on this analysis, generate a corrected schema.ts file that fixes all the issues identified.

Return only the fixed schema code. It should be valid TypeScript code. DO NOT INCLUDE A CHAT MESSAGE WITH THE FIXED CODE IN MARKDOWN!
`,
        },
      ],
      temperature: 0.2,
      abortSignal: signal,
    });

    log("info", "Schema fix complete", {
      responseLength: result.text.length,
    });

    return {
      code: result.text,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error ? error : new Error("Unknown error in fix schema"),
    );
    return null;
  }
}

function fromModelProvider(
  aiProvider: FpModelProvider,
  apiKey: string,
  aiGatewayUrl?: string,
) {
  switch (aiProvider) {
    case "openai":
      return aiModelFactory({
        apiKey,
        modelDetails: OPENAI_STRATEGY,
        aiGatewayUrl,
      });
    case "anthropic":
      return aiModelFactory({
        apiKey,
        modelDetails: ANTHROPIC_STRATEGY,
        aiGatewayUrl,
      });
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
