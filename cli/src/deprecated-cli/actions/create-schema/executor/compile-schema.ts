import fs from "node:fs";
import path from "node:path";
import { fixSchemaErrors } from "@/deprecated-cli/agents/schema-agent";
import { analyzeSchemaErrors } from "@/deprecated-cli/agents/schema-agent/analyze-typescript-errors";
import type { Context } from "@/deprecated-cli/context";
import { handleError } from "@/deprecated-cli/utils";
import { validateTypeScript } from "@/deprecated-cli/utils/typechecking/typecheck";
import { log, spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function compileSchema(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const compileSpinner = spinner();
  try {
    compileSpinner.start("Compiling schema with TypeScript...");

    // const result = await runShell(ctx.cwd, ["tsc --noEmit"]);
    const typescriptErrors = await validateTypeScript(
      ctx.cwd,
      ctx.packageManager,
    );

    const schemaErrors = typescriptErrors.filter((e) =>
      e?.location?.includes("schema.ts"),
    );

    if (schemaErrors?.length > 0) {
      log.warn(
        `Typescript errors in schema.ts: ${schemaErrors.length} \n ${JSON.stringify(schemaErrors, null, 2)}`,
      );
    }

    if (schemaErrors.length === 0) {
      compileSpinner.stop("Schema compiled successfully");
      return {
        // step: "generate_migration_files",
        step: "completed",
        status: "completed",
        data: step.data,
      };
    }

    compileSpinner.stop("TypeScript compilation failed, attempting to fix...");

    const analyzingSpinner = spinner();
    analyzingSpinner.start("Analyzing TypeScript errors...");

    const fixAnalysis = await analyzeSchemaErrors(
      ctx,
      step.data.finalSchema,
      schemaErrors,
    );
    analyzingSpinner.stop("TypeScript errors analyzed");

    // HACK - Just error out if the structured outputs failed
    if (!fixAnalysis) {
      compileSpinner.stop("Failed to analyze TypeScript errors");
      return {
        step: "compile_schema",
        status: "error",
        message: "Failed to analyze TypeScript errors",
        data: step.data,
      };
    }

    const fixContent = fixAnalysis.text;

    const fixSpinner = spinner();
    fixSpinner.start("Fixing TypeScript errors...");

    const fixedSchema = await fixSchemaErrors(
      ctx,
      step.data.finalSchema,
      fixContent,
    );

    // HACK - Just error out if the structured outputs failed
    if (!fixedSchema) {
      compileSpinner.stop("Failed to fix TypeScript errors");
      return {
        step: "compile_schema",
        status: "error",
        message: "Failed to fix TypeScript errors",
        data: step.data,
      };
    }

    step.data.finalSchema = fixedSchema;

    // Save the fixed schema
    const schemaPath = path.join(ctx.cwd, "src", "db", "schema.ts");
    fs.writeFileSync(schemaPath, step.data.finalSchema);

    fixSpinner.stop("Schema fix applied!");

    const retryResult = await validateTypeScript(ctx.cwd, ctx.packageManager);
    const retrySchemaErrors = retryResult.filter((e) =>
      e?.location?.includes("schema.ts"),
    );

    if (retrySchemaErrors.length === 0) {
      return {
        // step: "generate_migration_files",
        step: "completed",
        status: "completed",
        data: step.data,
      };
    }

    throw new Error(
      `TypeScript compilation still failing: ${retrySchemaErrors.length} errors`,
    );
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
