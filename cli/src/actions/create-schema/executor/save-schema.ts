import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/context";
import { handleError } from "@/utils/utils";
import { spinner } from "@clack/prompts";
import type { SchemaGenerationStep } from "../types";

export async function saveSchema(
  ctx: Context,
  step: SchemaGenerationStep,
): Promise<SchemaGenerationStep> {
  const saveSpinner = spinner();
  try {
    saveSpinner.start("Saving schema to src/db/schema.ts...");

    // Make sure the db directory exists
    const dbDir = path.join(ctx.cwd, "src", "db");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Save the schema file
    const schemaPath = path.join(dbDir, "schema.ts");
    fs.writeFileSync(schemaPath, step.data.finalSchema);

    // Save to context for future reference
    ctx.schemaFile = step.data.finalSchema;

    saveSpinner.stop("Schema saved to src/db/schema.ts");
    return {
      step: "compile_schema",
      status: "completed",
      data: step.data,
    };
  } catch (error) {
    saveSpinner.stop("Error saving schema");
    handleError(error as Error);
    return {
      step: "save_schema",
      status: "error",
      message: `Error saving schema: ${(error as Error).message}`,
      data: step.data,
    };
  }
}
