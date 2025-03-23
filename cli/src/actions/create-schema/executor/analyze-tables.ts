import type { Context } from "@/context";
import { analyzeDatabaseTables } from "@/integrations/schema-agent";
import { handleError } from "@/utils/utils";
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
    step.data.tables = tableAnalysis.object.tables;
    tablesSpinner.stop(`Identified ${step.data.tables.length} tables`);
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
