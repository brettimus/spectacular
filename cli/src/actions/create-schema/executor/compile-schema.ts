import fs from "node:fs";
import path from "node:path";
import { fixSchemaErrors } from "@/agents/schema-agent";
import type { Context } from "@/context";
import { handleError, runShell } from "@/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function compileSchema(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const compileSpinner = spinner();
  try {
    compileSpinner.start("Compiling schema with TypeScript...");

    try {
      const result = await runShell(ctx.cwd, ["tsc --noEmit"]);

      if (result.exitCode === 0) {
        compileSpinner.stop("Schema compiled successfully");
        return {
          step: "generate_migration_files",
          status: "completed",
          data: step.data,
        };
      }

      throw new Error(`TypeScript compilation failed: ${result.stderr}`);
    } catch (compileError) {
      compileSpinner.stop(
        "TypeScript compilation failed, attempting to fix...",
      );

      // Extract error message details
      const errorObj = compileError as Error | { stderr: string };
      const errorMessage =
        "stderr" in errorObj ? errorObj.stderr : errorObj.message;

      const fixSpinner = spinner();
      fixSpinner.start("Fixing TypeScript errors...");

      const fixedSchema = await fixSchemaErrors(
        ctx,
        step.data.finalSchema,
        errorMessage,
      );
      step.data.finalSchema = fixedSchema.object.fixedSchema;

      // Save the fixed schema
      const schemaPath = path.join(ctx.cwd, "src", "db", "schema.ts");
      fs.writeFileSync(schemaPath, step.data.finalSchema);

      fixSpinner.stop(`Schema fixed: ${fixedSchema.object.explanation}`);

      // Try compiling again
      try {
        const retryResult = await runShell(ctx.cwd, ["tsc --noEmit"]);

        if (retryResult.exitCode === 0) {
          return {
            step: "generate_migration_files",
            status: "completed",
            data: step.data,
          };
        }

        throw new Error(
          `TypeScript compilation still failing: ${retryResult.stderr}`,
        );
      } catch (retryError) {
        // Extract error details
        const retryErrorObj = retryError as Error | { stderr: string };
        const retryErrorMessage =
          "stderr" in retryErrorObj
            ? retryErrorObj.stderr
            : retryErrorObj.message;

        return {
          step: "compile_schema",
          status: "error",
          message: `Schema still has TypeScript errors: ${retryErrorMessage}`,
          data: step.data,
        };
      }
    }
  } catch (error) {
    compileSpinner.stop("Error during compilation process");
    handleError(error as Error);
    return {
      step: "compile_schema",
      status: "error",
      message: `Error during compilation: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
