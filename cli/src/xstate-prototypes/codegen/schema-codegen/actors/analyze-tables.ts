import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { fromPromise } from "xstate";
import { log } from "@/xstate-prototypes/utils/logging/logger";
import type { SchemaAnalysisOptions, SchemaAnalysisResult } from "./types";

// The system prompt used for analyzing database tables
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
  signal?: AbortSignal
): Promise<SchemaAnalysisResult> {
  try {
    const openai = createOpenAI({ apiKey });
    const model = traceAISDKModel(openai("gpt-4o"));

    // Ensure we have the spec content
    if (!options.specContent) {
      throw new Error("Spec content is required for schema analysis");
    }

    log("debug", "Analyzing database tables", {
      specLength: options.specContent.length,
    });

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

export const analyzeTablesActor = fromPromise<
  SchemaAnalysisResult,
  { apiKey: string; options: SchemaAnalysisOptions }
>(({ input, signal }) => analyzeTables(
  input.apiKey,
  input.options,
  signal
));
