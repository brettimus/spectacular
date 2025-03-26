import type { Context } from "@/context";
// import { confirm, log } from "@clack/prompts";
import { logActionExecution } from "../../../utils/logging";
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
  let result: SchemaGenerationStep;

  switch (step.step) {
    case "init":
      result = {
        step: "analyze_tables",
        status: "pending",
        data: step.data,
      };
      break;

    // Draft which tables are needed based on the spec
    case "analyze_tables": {
      result = await analyzeTables(ctx, step);
      break;
    }

    // Identify which rules are relevant to the operations
    // These should be injected as context into the generate_schema step
    case "identify_rules": {
      result = await identifyRules(ctx, step);
      break;
    }

    // Generate the schema file
    case "generate_schema": {
      result = await generateSchema(ctx, step);
      break;
    }

    // NOT IN USE!!! - This was kind of overkill
    //
    // Verify the generated schema
    case "verify_schema": {
      result = await verifySchema(ctx, step);
      break;
    }

    // Save the schema file to src/db/schema.ts
    case "save_schema": {
      result = await saveSchema(ctx, step);
      break;
    }

    // Compile the schema file with tsc
    case "compile_schema": {
      result = await compileSchema(ctx, step);
      // NOTE - Commented this out because I fixed some of the wonkiness with the compilation
      //
      // const confirmation = await confirm({
      //   message:
      //     "Are you sure you want to compile the schema? This part is broken right now",
      //   initialValue: false,
      // });
      // if (typeof confirmation !== "boolean" || !confirmation) {
      //   log.warning(
      //     "Skipping typescript compilation and database migration file checks",
      //   );
      //   result = {
      //     ...step,
      //     // step: "generate_migration_files",
      //     step: "completed",
      //     status: "completed",
      //     data: step.data,
      //   };
      // } else {
      //   result = await compileSchema(ctx, step);
      // }
      break;
    }

    // NOTE IN USE AS OF WRITING - but you should double check
    // Run the db:generate command to create the migration files
    case "generate_migration_files": {
      result = await generateMigrationFiles(ctx, step);
      break;
    }

    case "completed":
      result = { ...step, step: "done" };
      break;

    default:
      result = {
        step: "error",
        status: "error",
        message: `Unknown step: ${step.step}`,
        data: step.data,
      };
  }

  // Log the step execution
  logActionExecution(ctx, `create-schema-${result.step}`, {
    previousStep: step.step,
    currentStep: result.step,
    status: result.status,
    message: result.message,
    // We don't log the full data to avoid excessive log files
    dataKeys: Object.keys(result.data || {}),
  });

  return result;
}
