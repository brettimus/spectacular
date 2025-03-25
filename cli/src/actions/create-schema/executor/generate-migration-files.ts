import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/context";
import { fixSchemaErrors } from "@/integrations/schema-agent";
import { handleError, runShell } from "@/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function generateMigrationFiles(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const dbGenSpinner = spinner();
  try {
    dbGenSpinner.start("Running db:generate...");

    try {
      const result = await runShell(ctx.cwd, [
        `${ctx.packageManager} run db:generate`,
      ]);

      if (result.exitCode === 0) {
        dbGenSpinner.stop("Migration file generation completed successfully");
        return {
          step: "completed",
          status: "completed",
          data: step.data,
        };
      }

      throw new Error(`Migration file generation failed: ${result.stderr}`);
    } catch (dbGenError) {
      dbGenSpinner.stop(
        "Migration file generation failed, attempting to fix...",
      );

      // Extract detailed error information
      const errorObj = dbGenError as Error | { stderr: string; stdout: string };
      const errorOutput =
        "stderr" in errorObj
          ? `${errorObj.stderr}\n${errorObj.stdout || ""}`
          : errorObj.message;

      const fixSpinner = spinner();
      fixSpinner.start("Fixing migration file generation errors...");

      const fixedSchema = await fixSchemaErrors(
        ctx,
        step.data.finalSchema,
        errorOutput,
      );
      step.data.finalSchema = fixedSchema.object.fixedSchema;

      // Save the fixed schema
      const schemaPath = path.join(ctx.cwd, "src", "db", "schema.ts");
      fs.writeFileSync(schemaPath, step.data.finalSchema);

      fixSpinner.stop(
        `Migration file generation fixed: ${fixedSchema.object.explanation}`,
      );

      // Try generating again
      try {
        const retryResult = await runShell(ctx.cwd, [
          `${ctx.packageManager} run db:generate`,
        ]);

        if (retryResult.exitCode === 0) {
          return {
            step: "completed",
            status: "completed",
            data: step.data,
          };
        }

        throw new Error(
          `Migration file generation still failing: ${retryResult.stderr}`,
        );
      } catch (retryError) {
        // Extract detailed error information
        const retryErrorObj = retryError as
          | Error
          | { stderr: string; stdout: string };
        const retryErrorOutput =
          "stderr" in retryErrorObj
            ? `${retryErrorObj.stderr}\n${retryErrorObj.stdout || ""}`
            : retryErrorObj.message;

        return {
          step: "generate_migration_files",
          status: "error",
          message: `Migration file generation still failing: ${retryErrorOutput}`,
          data: step.data,
        };
      }
    }
  } catch (error) {
    dbGenSpinner.stop("Error during migration file generation");
    handleError(error as Error);
    return {
      step: "generate_migration_files",
      status: "error",
      message: `Error during migration file generation: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
