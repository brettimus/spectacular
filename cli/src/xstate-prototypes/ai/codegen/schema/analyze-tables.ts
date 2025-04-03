import { generateObject } from "ai";
import { z } from "zod";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type {
  SchemaAnalysisOptions,
  SchemaAnalysisResult,
} from "@/xstate-prototypes/ai/codegen/schema/types";
import { aiModelFactory, type FpModelProvider } from "../../ai-model-factory";

// Define strategies
const OPENAI_STRATEGY = {
  modelName: "gpt-4o", // Based on original actor
  modelProvider: "openai",
} as const;

const ANTHROPIC_STRATEGY = {
  modelName: "claude-3-7-sonnet-20250219", // Example
  modelProvider: "anthropic",
} as const;

// Schema definition for the output object
const SchemaAnalysisOutputSchema = z.object({
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
});

// System prompt
const SCHEMA_SYSTEM_PROMPT = `
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

/**
 * Analyze tables from specification using AI
 */
export async function analyzeTables(
  apiKey: string,
  options: SchemaAnalysisOptions,
  signal?: AbortSignal,
  aiProvider: FpModelProvider = "openai",
  aiGatewayUrl?: string,
): Promise<SchemaAnalysisResult> {
  try {
    const model = fromModelProvider(aiProvider, apiKey, aiGatewayUrl);

    // Ensure we have the spec content
    if (!options.specContent) {
      throw new Error("Spec content is required for schema analysis");
    }

    log("debug", "Analyzing database tables", {
      specLength: options.specContent.length,
    });

    const result = await generateObject({
      model,
      schema: SchemaAnalysisOutputSchema,
      messages: [
        {
          role: "user",
          content: `Please analyze this specification and determine the database tables needed:

${options.specContent}`,
        },
      ],
      system: SCHEMA_SYSTEM_PROMPT,
      temperature: 0.2,
      abortSignal: signal,
    });

    log("info", "Table analysis complete", {
      reasoningLength: result.object.reasoning.length,
      specificationLength: result.object.schemaSpecification.length,
    });

    return {
      reasoning: result.object.reasoning,
      schemaSpecification: result.object.schemaSpecification,
    };
  } catch (error) {
    log(
      "error",
      error instanceof Error
        ? error
        : new Error("Unknown error in analyze tables"),
    );
    throw error;
  }
}

// Helper function for model selection
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
