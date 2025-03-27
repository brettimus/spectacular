import fs from "node:fs";
import { findDirectoriesWithFixes } from "./readers/directory-reader";
import { findFixFile } from "./readers/fix-reader";
import { generateFixedSchema } from "./utils/schema-generator";
import { writeFixedSchema } from "./writers/schema-writer";

/**
 * Main function to generate fixed schema files based on error analysis
 */
export async function generateFixedSchemas(rootDir: string): Promise<void> {
  try {
    console.log("Finding directories with schema error fixes...");
    const dirs = findDirectoriesWithFixes(rootDir);

    if (dirs.length === 0) {
      console.log("No directories found with schema fixes.");
      return;
    }

    console.log(`Found ${dirs.length} directories to process.`);

    // Process each directory
    for (const dir of dirs) {
      console.log(`Processing directory: ${dir}`);

      // Find the fix file
      const fixFilePath = findFixFile(dir);
      if (!fixFilePath) {
        console.log(`No fix file found in ${dir}, skipping.`);
        continue;
      }

      // Read fix content
      console.log(`Reading fix from ${fixFilePath}`);
      const fixContent = fs.readFileSync(fixFilePath, "utf8");

      // Generate fixed schema
      const fixedSchema = await generateFixedSchema(fixContent);
      if (!fixedSchema) {
        console.log(
          `Failed to generate fixed schema for ${fixFilePath}, skipping.`,
        );
        continue;
      }

      // Write fixed schema to file
      const outputPath = writeFixedSchema(dir, fixedSchema);
      console.log(`Fixed schema written to ${outputPath}`);
    }

    console.log("Fixed schema generation complete!");
  } catch (error) {
    console.error("Error generating fixed schemas:", error);
  }
}

export * from "./readers/directory-reader";
export * from "./readers/fix-reader";
export * from "./utils/schema-generator";
export * from "./writers/schema-writer";
export * from "./types";
