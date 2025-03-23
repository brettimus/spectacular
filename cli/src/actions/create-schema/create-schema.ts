import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/context";
import pico from "picocolors";
import { executeStep } from "./executor";
import type { SchemaGenerationStep } from "./types";

// CURRENT - Implementation of create-schema functionality
//
// 1. Read the spec file (.spectacular/metadata.json->specPath)
// 2. Determine database tables from the spec (LLM call)
// 3. Generate a schema file (LLM call)
// 4. Verify the generated schema with a thinking model (LLM call)

// FUTURE - Proposed implementation of create-schema functionality
//
// 1. Read the spec file (.spectacular/metadata.json->specPath)
// 2. Determine database tables from the spec (LLM call)
// 3. Break down each operation that we want to perform to create the schema (LLM call)
// 4. Select relevant RULES to implement the proposed operations (LLM call)
// 5. For each operation:
//    - ~Search for relevant RULES from 4 to implement the operation (LLM call)~
//    - Generate a schema for each table (LLM call)
// 6. Verify the generated schema with a thinking model (LLM call)
// 7. Save the schema to `db/schema.ts`
// 8. Run `tsc` to compile the code
//    - Feed errors back into a fixer (LLM call)
// 9. Try running `db:generate`
//    - Feed errors back into a fixer (LLM call)
// 10. Save the schema to `db/schema.ts`
//

/**
 * Main function to orchestrate the schema creation process
 */
export async function actionCreateSchema(ctx: Context) {
  // Check if spec exists
  if (!ctx.specPath) {
    const metadataPath = path.join(ctx.cwd, ".spectacular", "metadata.json");
    try {
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        ctx.specPath = metadata.specPath;
      }
    } catch (error) {
      console.error("Error reading metadata:", error);
      throw new Error(
        "Could not find spec path. Make sure you have a .spectacular/metadata.json file.",
      );
    }
  }

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
      tables: [],
      operations: [],
      relevantRules: [],
      tableSchemas: [],
      finalSchema: "",
    },
  };

  // Track current state for our state machine
  let currentStep = initialState;
  let stepCount = 0;
  const MAX_STEPS = 20; // Prevent infinite loops

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
