import fs from "node:fs";
import path from "node:path";
import type { FixedSchema } from "../types";

/**
 * Write the fixed schema to a file in the specified directory
 */
export function writeFixedSchema(
  directoryPath: string,
  fixedSchema: FixedSchema,
): string {
  // Create a unique filename with timestamp
  const uniqueSuffix = Date.now().toString();
  const outputFileName = `fixed-schema-${uniqueSuffix}.ts`;
  const outputFilePath = path.join(directoryPath, outputFileName);

  // Add a header comment
  const fileContent = `/**
 * Fixed Drizzle ORM Schema
 * Generated on: ${new Date().toISOString()}
 * 
 * Explanation:
 * ${fixedSchema.explanation
   .split("\n")
   .map((line) => ` * ${line}`)
   .join("\n")}
 */

${fixedSchema.code}`;

  // Write to file
  fs.writeFileSync(outputFilePath, fileContent);

  return outputFilePath;
}
