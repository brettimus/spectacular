import fs from "node:fs";
import path from "node:path";

/**
 * Find directories in schema-generation folder that don't start with underscore
 * and don't already have a schema fix file
 */
export function findDirectoriesForAnalysis(rootDir: string): string[] {
  const schemaGenDir = path.join(rootDir, "data", "schema-generation");

  // Ensure the directory exists
  if (!fs.existsSync(schemaGenDir)) {
    throw new Error(`Schema generation directory not found: ${schemaGenDir}`);
  }

  const subdirs = fs
    .readdirSync(schemaGenDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("_"))
    .map((dirent) => dirent.name);

  // Filter out directories that already have a schema fix file
  const dirsNeedingAnalysis = subdirs.filter((dir) => {
    const dirPath = path.join(schemaGenDir, dir);
    const hasFixFile = fs
      .readdirSync(dirPath)
      .some((file) => file.startsWith("schema-error-fix"));

    return !hasFixFile;
  });

  // Return full paths to directories needing analysis
  return dirsNeedingAnalysis.map((dir) => path.join(schemaGenDir, dir));
}
