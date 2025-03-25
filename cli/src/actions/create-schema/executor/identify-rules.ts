import type { Context } from "@/context";
import { identifyRelevantRules } from "@/integrations/schema-agent";
import { handleError } from "@/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function identifyRules(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const rulesSpinner = spinner();
  try {
    rulesSpinner.start("Identifying relevant rules...");
    const rulesAnalysis = await identifyRelevantRules(ctx, step.data.tables);
    step.data.relevantRules = rulesAnalysis.object.selectedRules;
    rulesSpinner.stop(
      `Identified ${step.data.relevantRules.length} relevant rules`,
    );
    return {
      step: "generate_schema",
      status: "completed",
      data: step.data,
    };
  } catch (error) {
    rulesSpinner.stop("Error identifying rules");
    handleError(error as Error);
    return {
      step: "identify_rules",
      status: "error",
      message: `Error identifying rules: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
