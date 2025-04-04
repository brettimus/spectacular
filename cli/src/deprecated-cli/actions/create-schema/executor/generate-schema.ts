import { generateSchema as agentGenerateSchema } from "@/deprecated-cli/agents/schema-agent";
import type { Context } from "@/deprecated-cli/context";
import { handleError } from "@/deprecated-cli/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function generateSchema(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const schemaSpinner = spinner();
  try {
    schemaSpinner.start("Generating schema file...");

    schemaSpinner.message("Generating schema...");
    const tableSchema = await agentGenerateSchema(
      ctx,
      step.data.schemaSpecification,
      step.data.relevantRules,
    );
    step.data.finalSchema = tableSchema.object.dbSchemaTs;

    schemaSpinner.stop("Generated schemas database tables");
    return {
      step: "save_schema",
      status: "completed",
      data: step.data,
    };
  } catch (error) {
    schemaSpinner.stop("Error generating table schemas");
    handleError(error as Error);
    return {
      step: "generate_schema",
      status: "error",
      message: `Error generating table schemas: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
