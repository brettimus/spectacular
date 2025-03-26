import fs from "node:fs";
import path from "node:path";
import type { Any, SchemaData, SchemaError } from "../types";

/**
 * Find the most recent eval report JSON file in a directory
 */
export function findReportFile(dirPath: string): string | null {
  const files = fs
    .readdirSync(dirPath)
    .filter(
      (file) => file.endsWith(".json") && file.includes("spectacular-eval"),
    );

  if (files.length === 0) {
    return null;
  }

  // Sort by filename to get most recent (assuming proper timestamp naming)
  files.sort().reverse();
  return path.join(dirPath, files[0]);
}

/**
 * Extract specification, schema code, and errors from an eval report
 */
export function extractSchemaData(reportPath: string): SchemaData | null {
  try {
    const evalReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    // Extract input schema (specification)
    const inputSchema = evalReport.find((r: Any) => r.type === "input_schema");
    if (!inputSchema?.data?.specFileDetails?.spec) {
      console.log(`No input specification found in ${reportPath}`);
      return null;
    }

    // Extract generated schema code
    const outputSchema = evalReport.find(
      (r: Any) => r.type === "output_schema",
    );
    if (!outputSchema?.data?.code) {
      console.log(`No output schema code found in ${reportPath}`);
      return null;
    }

    // Extract TypeScript errors
    const typescriptValidity = evalReport.find(
      (r: Any) => r.scope === "typescript-validity",
    );
    if (!typescriptValidity?.data?.errors) {
      console.log(`No TypeScript errors found in ${reportPath}`);
      return null;
    }

    // Filter for errors related to schema.ts
    const schemaErrors = typescriptValidity.data.errors.filter(
      (error: SchemaError) => error.location.includes("schema.ts"),
    );

    if (schemaErrors.length === 0) {
      console.log(`No schema.ts errors found in ${reportPath}`);
      return null;
    }

    return {
      spec: inputSchema.data.specFileDetails.spec,
      schemaTs: outputSchema.data.code,
      schemaErrors,
      reportPath,
    };
  } catch (error) {
    console.error(`Error extracting schema data from ${reportPath}:`, error);
    return null;
  }
}
