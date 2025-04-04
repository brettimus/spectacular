import { analyzeDatabaseTables } from "@/deprecated-cli/agents/schema-agent";
import type { Context } from "@/deprecated-cli/context";
import { handleError } from "@/deprecated-cli/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function analyzeTables(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const tablesSpinner = spinner();
  try {
    tablesSpinner.start(
      "Analyzing specification to determine database tables...",
    );
    const tableAnalysis = await analyzeDatabaseTables(ctx);
    step.data.schemaSpecification = tableAnalysis.object.schemaSpecification;
    // TODO - save the schema specification to the global debug directory
    tablesSpinner.stop("Drafted schema specification");
    return {
      step: "identify_rules",
      status: "completed",
      data: step.data,
    };
  } catch (error) {
    tablesSpinner.stop("Error analyzing tables");
    handleError(error as Error);
    return {
      step: "analyze_tables",
      status: "error",
      message: `Error analyzing tables: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
