import { verifyGeneratedSchema } from "@/agents/schema-agent";
import type { Context } from "@/context";
import { handleError } from "@/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function verifySchema(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const verifySpinner = spinner();
  try {
    verifySpinner.start("Verifying generated schema...");
    const verification = await verifyGeneratedSchema(
      ctx,
      step.data.finalSchema,
    );

    if (!verification.object.isValid) {
      verifySpinner.stop("Schema verification found issues, fixing...");
      step.data.finalSchema = verification.object.fixedSchema;
      console.log(`Fixed issues: ${verification.object.issues.join(", ")}`);
    } else {
      verifySpinner.stop("Schema verified successfully");
    }

    return {
      step: "save_schema",
      status: "completed",
      data: step.data,
    };
  } catch (error) {
    verifySpinner.stop("Error verifying schema");
    handleError(error as Error);
    return {
      step: "verify_schema",
      status: "error",
      message: `Error verifying schema: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
