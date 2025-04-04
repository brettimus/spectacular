import fs from "node:fs";
import type { Context } from "@/deprecated-cli/context";
import pico from "picocolors";
import { initCommandLogSession } from "../../utils/logging";
import { executeStep } from "./executor";
import { loadExistingSpec } from "./load-existing-spec";
import type { SchemaGenerationStep } from "./types";

// CURRENT - Implementation of create-schema functionality
//
// 1. Read the spec file (spectacular/metadata.json->specPath)
// 2. Determine database tables from the spec (LLM call)
// 3. Generate a schema file (LLM call)
// 4. Save the schema to `db/schema.ts`
// 5. Compile the schema with tsc
// 6. - If errors, fix the schema with web search
// 7. Run `db:generate`
// 8. Save the schema to `db/schema.ts`

/**
 * Main function to orchestrate the schema creation process
 */
export async function actionCreateSchema(ctx: Context) {
  // Initialize log session for this command
  initCommandLogSession(ctx, "create-schema");

  loadExistingSpec(ctx);

  // Read spec file if not already loaded
  if (!ctx.specContent && ctx.specPath) {
    try {
      if (fs.existsSync(ctx.specPath)) {
        ctx.specContent = fs.readFileSync(ctx.specPath, "utf-8");
      } else {
        throw new Error(`Spec file not found at ${ctx.specPath}`);
      }
    } catch (error) {
      console.error("Error reading spec file:", error);
      throw new Error(`Could not read spec file at ${ctx.specPath}`);
    }
  }

  if (!ctx.specContent) {
    throw new Error("No spec content found. Please create a spec first.");
  }

  // Define the initial state for our state machine
  const initialState: SchemaGenerationStep = {
    step: "init",
    status: "pending",
    data: {
      operations: [],
      relevantRules: [],
      tableSchemas: [],
      finalSchema: "",
      schemaSpecification: "",
    },
  };

  // Track current state for our state machine
  let currentStep = initialState;
  let stepCount = 0;
  const MAX_STEPS = 12; // Prevent infinite loops

  // Start processing steps
  while (
    currentStep.step !== "done" &&
    currentStep.step !== "error" &&
    stepCount < MAX_STEPS
  ) {
    stepCount++;
    console.log(`${pico.cyan("→")} Starting step: ${currentStep.step}`);

    try {
      currentStep = await executeStep(ctx, currentStep);
      if (currentStep.status === "completed") {
        console.log(`${pico.green("✓")} Completed step: ${currentStep.step}`);
      }
    } catch (error) {
      console.error(
        `${pico.red("✖")} Error in step ${currentStep.step}:`,
        error,
      );
      currentStep = {
        ...currentStep,
        status: "error",
        message: `Error in step ${currentStep.step}: ${(error as Error).message}`,
      };
    }
  }

  // Return final result
  if (currentStep.status === "error") {
    throw new Error(`Schema creation failed: ${currentStep.message}`);
  }

  return currentStep.data;
}
