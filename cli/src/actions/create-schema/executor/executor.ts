import type { Context } from "@/context";
import { confirm, log } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";
import { analyzeTables } from "./analyze-tables";
import { compileSchema } from "./compile-schema";
import { generateMigrationFiles } from "./generate-migration-files";
import { generateSchema } from "./generate-schema";
import { identifyRules } from "./identify-rules";
import { saveSchema } from "./save-schema";
import { verifySchema } from "./verify-schema";

/**
 * Process the current step in the schema generation pipeline
 */
export async function executeStep(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  // If we already have an error, don't continue processing
  if (step.status === "error") {
    return { ...step, step: "error" };
  }

  // Execute step based on current state
  switch (step.step) {
    case "init":
      return {
        step: "analyze_tables",
        status: "pending",
        data: step.data,
      };

    // Draft which tables are needed based on the spec
    case "analyze_tables": {
      return await analyzeTables(ctx, step);
    }

    // Identify which rules are relevant to the operations
    // These should be injected as context into the generate_schema step
    case "identify_rules": {
      return await identifyRules(ctx, step);
    }

    // Generate the schema file
    case "generate_schema": {
      return await generateSchema(ctx, step);
    }

    // Verify the generated schema
    case "verify_schema": {
      return await verifySchema(ctx, step);
    }

    // Save the schema file to src/db/schema.ts
    case "save_schema": {
      return await saveSchema(ctx, step);
    }

    // Compile the schema file with tsc
    case "compile_schema": {
      const confirmation = await confirm({
        message:
          "Are you sure you want to compile the schema? This part is broken right now",
        initialValue: false,
      });
      if (typeof confirmation !== "boolean" || !confirmation) {
        log.warning(
          "Skipping typescript compilation and database migration file checks",
        );
        return {
          ...step,
          // step: "generate_migration_files",
          step: "completed",
          status: "completed",
          data: step.data,
        };
      }
      return await compileSchema(ctx, step);
    }

    // Run the db:generate command to create the migration files
    case "generate_migration_files": {
      return await generateMigrationFiles(ctx, step);
    }

    case "completed":
      return { ...step, step: "done" };

    default:
      return {
        step: "error",
        status: "error",
        message: `Unknown step: ${step.step}`,
        data: step.data,
      };
  }
}
