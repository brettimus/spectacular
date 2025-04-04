import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/deprecated-cli/context";

interface SchemaResult {
  schemaPath: string;
  schema: string;
}

export async function loadExistingSchema(
  context: Context,
): Promise<SchemaResult> {
  // Find the schema file in the spectacular directory
  const schemaDir = path.join(context.cwd, "src", "db");
  const schemaPath = path.join(schemaDir, "schema.ts");

  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      "Database schema not found. Please run 'npx @fiberplane/spectacular-cli create-schema' first.",
    );
  }

  // Read the schema file
  const schema = fs.readFileSync(schemaPath, "utf-8");

  return {
    schemaPath,
    schema,
  };
}
